import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  userId!: string;
  user: any;
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private route: ActivatedRoute, private userService: UserService) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    console.log('User ID from route:', this.userId);
    if (this.userId) {
      this.userService.getUserById(this.userId).subscribe({
        next: (data) => {
          this.user = data;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load user data.';
          this.isLoading = false;
        }
      });
    } else {
      this.errorMessage = 'Invalid user ID.';
      this.isLoading = false;
    }
  }
}
