import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subject, debounceTime, switchMap } from 'rxjs';
import { MovieRecommendationService } from './movie-rec.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  // Component properties
  title = 'Movie Recommender';
  movieName: string = '';
  recommendedMovies: any[] = [];
  isRequesting = false;
  errorMessage: string = '';
  private searchTerms = new Subject<string>();
  searchResults: string[] = [];

  // Reference to the search field in the template
  @ViewChild('searchField')
  searchField!: ElementRef;

  // Constructor injecting the MovieRecommendationService
  constructor(private movieRecommendationService: MovieRecommendationService) {}

  // OnInit lifecycle hook
  ngOnInit(): void {
    // Use RxJS operators to handle search term changes
    this.searchTerms
      .pipe(
        debounceTime(300),
        switchMap((term: string) =>
          this.movieRecommendationService.getAutoCompleteSuggestions(term)
        )
      )
      .subscribe(
        // Handle successful response
        (response: any) => {
          this.searchResults = response.suggestions;
        },
        // Handle error
        (error: any) => {
          console.error('There is an error:', error);
        }
      );
  }

  // HostListener for document click to close search results dropdown
  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: Event) {
    const clickedElement = event.target as HTMLElement;
    if (!this.searchField.nativeElement.contains(clickedElement)) {
      this.searchResults = [];
    }
  }

  // Event handler for input change
  onModelChange($event: string) {
    this.searchTerms.next($event);
  }

  // Event handler for selecting a search result
  selectResult(selectedResult: string) {
    this.movieName = selectedResult;
    this.searchResults = [];
  }

  // Event handler for form submission
  submit(): void {
    this.errorMessage = '';
    if (this.movieName != '') {
      this.isRequesting = true;
      // Make a request to get movie recommendations
      this.movieRecommendationService
        .getMovieRecommendations(this.movieName)
        .subscribe({
          // Handle successful response
          next: (response: any) => {
            this.isRequesting = false;
            this.recommendedMovies = response.recommendations;
          },
          // Handle error
          error: (error) => {
            this.isRequesting = false;
            this.errorMessage =
              'Movie not found in our database... Please try another!';
            console.error('Error fetching recommendations:', error);
          },
        });
    } else {
      // Display error for empty input
      this.errorMessage = "Field can't be empty.";
      console.error('Input is null.');
    }
  }
}
