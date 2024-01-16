from pyspark.ml.feature import *
from pyspark.ml import *
import pyspark.sql.functions as F
from pyspark.sql.types import *
from pyspark.ml.param.shared import *
from pyspark.ml.linalg import *
from pyspark.ml.util import *

# Initialize Spark session
spark = SparkSession.builder.appName("Data Processor").getOrCreate()

# Read data from CSV file
df = spark.read.csv(
    "./TMDB_movie_dataset_v11.csv", header=True, quote='"', escape='"'
)

# Columns to handle missing or null values
with_na = [
    "original_language",
    "overview",
    "genres",
    "production_countries",
]

# Data preprocessing steps
filtered_df = (
    df.withColumn("vote_average", F.col("vote_average").cast("float"))
    .withColumn("release_year", F.year("release_date").cast("int"))
    .withColumn("revenue", F.col("revenue").cast("long"))
    .withColumn("runtime", F.col("runtime").cast("int"))
    .withColumn("popularity", F.col("popularity").cast("float"))
    .filter(
        (F.col("vote_average") != 0)
        & (F.col("status") == "Released")
        & (F.col("release_year").isNotNull())
        & (F.col("revenue").isNotNull())
        & (F.col("runtime").isNotNull())
        & (F.col("popularity") != 0)
        & (F.col("poster_path").isNotNull())
    )
    .fillna("NA", subset=with_na)
)

# Tokenize and vectorize language data
languages_tokenizer = (
    RegexTokenizer()
    .setInputCol("original_language")
    .setOutputCol("languages_token")
    .setPattern(",")
)

languages_vectorizer = (
    CountVectorizer().setInputCol("languages_token").setOutputCol("languages_vector")
)

# Tokenize and vectorize genres data
genres_tokenizer = (
    RegexTokenizer().setInputCol("genres").setOutputCol("genres_token").setPattern(",")
)

genres_vectorizer = (
    CountVectorizer().setInputCol("genres_token").setOutputCol("genres_vector")
)

# Tokenize and vectorize production countries data
countries_tokenizer = (
    RegexTokenizer()
    .setInputCol("production_countries")
    .setOutputCol("countries_token")
    .setPattern(",")
)

countries_vectorizer = (
    CountVectorizer().setInputCol("countries_token").setOutputCol("countries_vector")
)

# Assemble features into a single vector
features_vectorAssembler = (
    VectorAssembler()
    .setInputCols(
        [
            "languages_vector",
            "genres_vector",
            "countries_vector",
            "vote_average",
            "release_year",
            "revenue",
            "runtime",
            "popularity",
        ]
    )
    .setOutputCol("raw_features")
)

# Scale features to a specific range
features_scaler = MinMaxScaler().setInputCol("raw_features").setOutputCol("features")

# Define the processing stages
stages = [
    languages_tokenizer,
    languages_vectorizer,
    genres_tokenizer,
    genres_vectorizer,
    countries_tokenizer,
    countries_vectorizer,
    features_vectorAssembler,
    features_scaler,
]

# Columns to select in the final processed dataframe
features = [
    "id",
    "title",
    "vote_average",
    "release_date",
    "runtime",
    "overview",
    "poster_path",
    "genres",
    "features",
]

# Create a pipeline and transform the data
processed_df = (
    Pipeline(stages=stages).fit(filtered_df).transform(filtered_df).select(features)
)

# Write the processed dataframe to Parquet format
processed_df.write.format("parquet").save("../backend/app/processed")
