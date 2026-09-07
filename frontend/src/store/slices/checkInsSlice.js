import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchRecentCheckIns = createAsyncThunk('checkIns/fetchRecent', async (limit = 10, { rejectWithValue }) => {
  try {
    const res = await api.get(`/api/checkins?limit=${limit}`);
    return res.data.checkIns || [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch check-ins');
  }
});

export const addCheckIn = createAsyncThunk('checkIns/addCheckIn', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/api/checkins', payload);
    return res.data.checkIn;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to save check-in');
  }
});

const checkInsSlice = createSlice({
  name: 'checkIns',
  initialState: {
    recent: [],
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchRecentCheckIns
      .addCase(fetchRecentCheckIns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentCheckIns.fulfilled, (state, action) => {
        state.recent = action.payload;
        state.loading = false;
      })
      .addCase(fetchRecentCheckIns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // addCheckIn
      .addCase(addCheckIn.pending, (state) => {
        state.submitting = true;
      })
      .addCase(addCheckIn.fulfilled, (state, action) => {
        state.recent.unshift(action.payload);
        state.submitting = false;
      })
      .addCase(addCheckIn.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export default checkInsSlice.reducer;
