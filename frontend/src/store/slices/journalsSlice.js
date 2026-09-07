import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchJournals = createAsyncThunk('journals/fetchJournals', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/journals');
    return res.data.journals || [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load journals');
  }
});

export const addJournal = createAsyncThunk('journals/addJournal', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/api/journals', payload);
    return res.data.journal;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to save entry');
  }
});

export const updateJournal = createAsyncThunk('journals/updateJournal', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/api/journals/${id}`, data);
    return res.data.journal;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update entry');
  }
});

export const deleteJournal = createAsyncThunk('journals/deleteJournal', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/api/journals/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete entry');
  }
});

const journalsSlice = createSlice({
  name: 'journals',
  initialState: {
    items: [],
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchJournals
      .addCase(fetchJournals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJournals.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchJournals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // addJournal
      .addCase(addJournal.pending, (state) => {
        state.submitting = true;
      })
      .addCase(addJournal.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.submitting = false;
      })
      .addCase(addJournal.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      // updateJournal
      .addCase(updateJournal.pending, (state) => {
        state.submitting = true;
      })
      .addCase(updateJournal.fulfilled, (state, action) => {
        const idx = state.items.findIndex(j => j._id === action.payload._id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
        state.submitting = false;
      })
      .addCase(updateJournal.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      // deleteJournal
      .addCase(deleteJournal.fulfilled, (state, action) => {
        state.items = state.items.filter(j => j._id !== action.payload);
      });
  },
});

export default journalsSlice.reducer;
