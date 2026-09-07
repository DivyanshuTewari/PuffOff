import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchUsageLogs = createAsyncThunk('tracker/fetchUsageLogs', async (addictionId, { rejectWithValue }) => {
  if (!addictionId) return [];
  try {
    const res = await api.get(`/api/usagelogs?addictionId=${addictionId}`);
    return res.data.logs || [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch usage logs');
  }
});

export const addUsageLog = createAsyncThunk('tracker/addUsageLog', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/api/usagelogs', payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to save log');
  }
});

export const deleteUsageLog = createAsyncThunk('tracker/deleteUsageLog', async (logId, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/api/usagelogs/${logId}`);
    return { logId, addiction: res.data?.addiction };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete log');
  }
});

const trackerSlice = createSlice({
  name: 'tracker',
  initialState: {
    logs: [],
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {
    clearLogs(state) {
      state.logs = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUsageLogs
      .addCase(fetchUsageLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsageLogs.fulfilled, (state, action) => {
        state.logs = action.payload;
        state.loading = false;
      })
      .addCase(fetchUsageLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // addUsageLog
      .addCase(addUsageLog.pending, (state) => {
        state.submitting = true;
      })
      .addCase(addUsageLog.fulfilled, (state, action) => {
        const log = action.payload?.log || action.payload;
        if (log) {
          state.logs.unshift(log);
        }
        state.submitting = false;
      })
      .addCase(addUsageLog.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      // deleteUsageLog
      .addCase(deleteUsageLog.fulfilled, (state, action) => {
        const id = action.payload?.logId || action.payload;
        state.logs = state.logs.filter((l) => l._id !== id);
      })
      // Cross-slice sync: Rescuer consumption logs create a Tracker row
      .addCase('rescuer/logDaily/fulfilled', (state, action) => {
        if (action.payload?.usageLog) {
          state.logs.unshift(action.payload.usageLog);
        }
      })
      .addCase('rescuer/logExtra/fulfilled', (state, action) => {
        if (action.payload?.usageLog) {
          state.logs.unshift(action.payload.usageLog);
        }
      })
      // Cross-slice sync: Dashboard relapse creates a Tracker row
      .addCase('addictions/logRelapse/fulfilled', (state, action) => {
        if (action.payload?.usageLog) {
          state.logs.unshift(action.payload.usageLog);
        }
      })
      // Cross-slice sync: Deleting an addiction clears its tracker logs
      .addCase('addictions/deleteAddiction/fulfilled', (state, action) => {
        const addictionId = action.payload?.id || action.payload;
        if (addictionId) {
          state.logs = state.logs.filter((l) => l.addictionId !== addictionId);
        }
      });
  },
});

export const { clearLogs } = trackerSlice.actions;
export default trackerSlice.reducer;
