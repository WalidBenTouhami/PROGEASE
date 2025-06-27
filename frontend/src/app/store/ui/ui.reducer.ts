import { createReducer, on } from '@ngrx/store';

export interface State {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  loading: boolean;
  notifications: any[];
}

export const initialState: State = {
  sidebarOpen: false,
  theme: 'light',
  loading: false,
  notifications: []
};

export const reducer = createReducer(
  initialState,
  // Add your UI actions here when you create them
  // Example:
  // on(UIActions.toggleSidebar, state => ({ ...state, sidebarOpen: !state.sidebarOpen })),
  // on(UIActions.setTheme, (state, { theme }) => ({ ...state, theme })),
  // on(UIActions.setLoading, (state, { loading }) => ({ ...state, loading }))
); 