import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MovieRecommendationService {
  // Backend host and API endpoint
  private backendHost = 'localhost';
  private backendUrl = '/api';

  /**
   * Constructor of the MovieRecommendationService
   * @param http - Angular HttpClient for making HTTP requests
   */
  constructor(private http: HttpClient) {
    // Retrieve backend host from configuration file
    this.http.get('/assets/config.json').subscribe((config: any) => {
      this.backendHost = config.backendHost;
    });
  }

  /**
   * Get movie recommendations for a given movie name
   * @param movieName - Name of the movie for which recommendations are requested
   * @returns Observable<any> - Observable containing the movie recommendations
   */
  getMovieRecommendations(movieName: string): Observable<any> {
    const requestBody = { movie: movieName };

    // Make a POST request to the movie recommendations API endpoint
    return this.http
      .post(`${this.backendHost}${this.backendUrl}/rec`, requestBody)
      .pipe(catchError((error) => throwError(() => new Error(error.message))));
  }

  /**
   * Get autocomplete suggestions based on search terms
   * @param searchTerms - Search terms for which autocomplete suggestions are requested
   * @returns Observable<any> - Observable containing the autocomplete suggestions
   */
  getAutoCompleteSuggestions(searchTerms: string): Observable<any> {
    const requestBody = { query: searchTerms };

    // Make a POST request to the autocomplete suggestions API endpoint
    return this.http
      .post(`${this.backendHost}${this.backendUrl}/auto`, requestBody)
      .pipe(catchError((error) => throwError(() => new Error(error.message))));
  }
}
