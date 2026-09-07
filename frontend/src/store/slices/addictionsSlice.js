import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchAddictions = createAsyncThunk('addictions/fetchAddictions', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/addictions');
    return res.data.addictions || [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch addictions');
  }
});

export const addAddiction = createAsyncThunk('addictions/addAddiction', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/api/addictions', payload);
    return res.data.addiction;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add vice');
  }
});

export const updateAddiction = createAsyncThunk('addictions/updateAddiction', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/api/addictions/${id}`, data);
    return res.data.addiction;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update vice');
  }
});

export const deleteAddiction = createAsyncThunk('addictions/deleteAddiction', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/api/addictions/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete vice');
  }
});

export const logRelapse = createAsyncThunk('addictions/logRelapse', async ({ id, note = 'Manual relapse log' }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/api/addictions/${id}/relapse`, { note });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to log relapse');
  }
});

const updateAddictionInList = (state, addiction) => {
  if (!addiction || !addiction._id) return;
  const idx = state.items.findIndex((a) => a._id === addiction._id);
  if (idx !== -1) {
    state.items[idx] = addiction;
  }
};

const addictionsSlice = createSlice({
  name: 'addictions',
  initialState: {
    items: [],
    loading: false,
    error: null,
    selectedId: null,
  },
  reducers: {
    setSelectedAddiction(state, action) {
      state.selectedId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAddictions
      .addCase(fetchAddictions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddictions.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        if (!state.selectedId && action.payload.length > 0) {
          state.selectedId = action.payload[0]._id;
        }
      })
      .addCase(fetchAddictions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // addAddiction
      .addCase(addAddiction.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        if (!state.selectedId) state.selectedId = action.payload._id;
      })
      // updateAddiction
      .addCase(updateAddiction.fulfilled, (state, action) => {
        updateAddictionInList(state, action.payload);
      })
      // deleteAddiction
      .addCase(deleteAddiction.fulfilled, (state, action) => {
        const id = action.payload?.id || action.payload;
        state.items = state.items.filter((a) => a._id !== id);
        if (state.selectedId === id) {
          state.selectedId = state.items.length > 0 ? state.items[0]._id : null;
        }
      })
      // logRelapse
      .addCase(logRelapse.fulfilled, (state, action) => {
        const addiction = action.payload?.addiction || action.payload;
        updateAddictionInList(state, addiction);
      })
      // Cross-slice sync: Tracker actions that modify addiction stats
      .addCase('tracker/addUsageLog/fulfilled', (state, action) => {
        if (action.payload?.addiction) {
          updateAddictionInList(state, action.payload.addiction);
        }
      })
      .addCase('tracker/deleteUsageLog/fulfilled', (state, action) => {
        if (action.payload?.addiction) {
          updateAddictionInList(state, action.payload.addiction);
        }
      })
      // Cross-slice sync: Rescuer actions that modify addiction stats
      .addCase('rescuer/logDaily/fulfilled', (state, action) => {
        if (action.payload?.addiction) {
          updateAddictionInList(state, action.payload.addiction);
        }
      })
      .addCase('rescuer/logExtra/fulfilled', (state, action) => {
        if (action.payload?.addiction) {
          updateAddictionInList(state, action.payload.addiction);
        }
      });
  },
});

export const { setSelectedAddiction } = addictionsSlice.actions;
export default addictionsSlice.reducer;
