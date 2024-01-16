from flask import *
from flask_cors import CORS
from pyspark.sql import *
import pyspark.sql.functions as F
import logging

# Initialize Spark session
spark = SparkSession.builder.appName("Movies Recommender").getOrCreate()

# Read processed data from Parquet file
df = spark.read.parquet("./processed")

# Define host and port for the Flask app
HOST = "0.0.0.0"
PORT = 4000

# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app)

# Autocomplete Suggestions Endpoint
@app.route("/api/auto", methods=["POST"])
def autocomplete_suggestions():
    # Extract search query from the request JSON
    query = request.get_json().get("query")
    logging.info(f"Received autocomplete query: {query}...")

    # Generate autocomplete suggestions based on the query
    if query != "":
        suggestions_df = (
            df.filter(F.lower(F.col("title")).like(f"%{query.lower()}%"))
            .select("title", "vote_average")
            .distinct()
            .orderBy(F.desc("vote_average"), "title")
            .limit(10)
            .collect()
        )
        suggestions = [row["title"] for row in suggestions_df]
    else:
        suggestions = []

    # Return suggestions in JSON format
    return jsonify({"suggestions": suggestions})


# Movie Recommendations Endpoint
@app.route("/api/rec", methods=["POST"])
def make_recommendations():
    # Extract selected movie from the request JSON
    movie = request.get_json().get("movie")
    logging.info(f"Received request for movie: {movie}...")
    logging.info(f"Extracting movie features...")

    # Extract features for the selected movie
    movie_features = (
        df.filter(F.col("title") == movie).select("features").collect()[0]["features"]
    )

    # Define Euclidean distance calculation function
    def euclidean_distance(vector):
        return float(movie_features.squared_distance(vector)) ** 0.5

    # Register Euclidean distance as a Spark UDF
    euclidean_distance_udf = spark.udf.register(
        "euclidean_distance", euclidean_distance, "float"
    )

    logging.info(f"Making recommendations for {movie}...")

    # Generate movie recommendations based on Euclidean distance
    recommended = (
        df.withColumn("euclidean_distance", euclidean_distance_udf("features"))
        .orderBy("euclidean_distance", ascending=True)
        .limit(9)
        .drop("features")
    )

    logging.info(f"Recommendations generated!")

    # Return recommendations in JSON format
    return jsonify({"recommendations": [row.asDict() for row in recommended.collect()]})


# Run the Flask app if executed as the main module
if __name__ == "__main__":
    app.run(host=HOST, port=PORT)
