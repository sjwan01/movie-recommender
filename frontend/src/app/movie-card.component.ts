// Import necessary Angular core components
import { Component, Input } from '@angular/core';

// Define the MovieCardComponent
@Component({
  selector: 'app-movie-card', // HTML selector for this component
  templateUrl: './movie-card.component.html', // HTML template file
  styleUrls: ['./movie-card.component.css'] // CSS styles for this component
})
export class MovieCardComponent {
  // Input property to receive movie data from the parent component
  @Input() movie: any;

  // Method to generate an array of stars based on the movie rating
  getStarArray(rating: number): number[] {
    // Calculate the number of full stars
    const fullStars = Math.floor(rating);

    // Check if there's a half star
    const hasHalfStar = rating % 1 !== 0;

    // Create an array with full stars
    const starArray = Array(fullStars).fill(1);

    // Add a half star if present
    if (hasHalfStar) {
      starArray.push(0.5);
    }

    // Calculate the remaining stars needed to reach a total of 10 stars
    const remainingStars = 10 - starArray.length;

    // Add remaining stars as empty (0) stars
    starArray.push(...Array(remainingStars).fill(0));

    // Return the generated star array
    return starArray;
  }
}
