import { createReducer, on } from '@ngrx/store';
import { User } from '../../core/models/user.model';

export interface State {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

export const initialState: State = {
  users: [],
  currentUser: null,
  loading: false,
  error: null
};

export const reducer = createReducer(
  initialState,
  // Add your user actions here when you create them
  // Example:
  // on(UserActions.loadUsers, state => ({ ...state, loading: true })),
  // on(UserActions.loadUsersSuccess, (state, { users }) => ({ ...state, users, loading: false })),
  // on(UserActions.loadUsersFailure, (state, { error }) => ({ ...state, error, loading: false }))
); 