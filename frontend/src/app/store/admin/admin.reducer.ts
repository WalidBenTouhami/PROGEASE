import { createReducer, on } from '@ngrx/store';

export interface State {
  dashboardData: any;
  statistics: any;
  loading: boolean;
  error: string | null;
}

export const initialState: State = {
  dashboardData: null,
  statistics: null,
  loading: false,
  error: null
};

export const reducer = createReducer(
  initialState,
  // Add your admin actions here when you create them
  // Example:
  // on(AdminActions.loadDashboardData, state => ({ ...state, loading: true })),
  // on(AdminActions.loadDashboardDataSuccess, (state, { data }) => ({ ...state, dashboardData: data, loading: false })),
  // on(AdminActions.loadDashboardDataFailure, (state, { error }) => ({ ...state, error, loading: false }))
); 