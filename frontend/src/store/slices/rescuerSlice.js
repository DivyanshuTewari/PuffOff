import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchRescuerPlans = createAsyncThunk('rescuer/fetchPlans', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/rescuer');
    return res.data.plans || [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch rescuer plans');
  }
});

export const fetchPlanById = createAsyncThunk('rescuer/fetchPlanById', async (planId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/api/rescuer/plan/${planId}`);
    return res.data.plan;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch plan details');
  }
});

export const createRescuerPlan = createAsyncThunk('rescuer/createPlan', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/api/rescuer', payload);
    return res.data.plan;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create plan');
  }
});

export const updateRescuerPlan = createAsyncThunk('rescuer/updatePlan', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/api/rescuer/${id}`, data);
    return res.data.plan;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update plan');
  }
});

export const deleteRescuerPlan = createAsyncThunk('rescuer/deletePlan', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/api/rescuer/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete plan');
  }
});

export const logDailyConsumption = createAsyncThunk('rescuer/logDaily', async ({ planId, consumed }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/api/rescuer/${planId}/log`, { consumed });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to log daily consumption');
  }
});

export const logExtraConsumption = createAsyncThunk('rescuer/logExtra', async ({ planId, note }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/api/rescuer/${planId}/extra`, { note });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to log extra consumption');
  }
});

export const logUrgeResisted = createAsyncThunk('rescuer/logResist', async (planId, { rejectWithValue }) => {
  try {
    const res = await api.post(`/api/rescuer/${planId}/resist`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to log resisted urge');
  }
});

const updatePlanInState = (state, plan) => {
  if (!plan || !plan._id) return;
  const idx = state.plans.findIndex((p) => p._id === plan._id);
  if (idx !== -1) {
    state.plans[idx] = plan;
  } else {
    state.plans.push(plan);
  }
  if (state.activePlan?._id === plan._id || (!state.activePlan && plan.isActive)) {
    state.activePlan = plan;
  }
};

const rescuerSlice = createSlice({
  name: 'rescuer',
  initialState: {
    plans: [],
    activePlan: null,
    loading: false,
    activeLoading: false,
    error: null,
  },
  reducers: {
    clearActivePlan(state) {
      state.activePlan = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPlans
      .addCase(fetchRescuerPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRescuerPlans.fulfilled, (state, action) => {
        state.plans = action.payload;
        state.loading = false;
      })
      .addCase(fetchRescuerPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchPlanById
      .addCase(fetchPlanById.pending, (state) => {
        state.activeLoading = true;
      })
      .addCase(fetchPlanById.fulfilled, (state, action) => {
        state.activePlan = action.payload;
        state.activeLoading = false;
      })
      .addCase(fetchPlanById.rejected, (state, action) => {
        state.activeLoading = false;
        state.error = action.payload;
      })
      // createRescuerPlan
      .addCase(createRescuerPlan.fulfilled, (state, action) => {
        state.plans.push(action.payload);
        state.activePlan = action.payload;
      })
      // updateRescuerPlan
      .addCase(updateRescuerPlan.fulfilled, (state, action) => {
        const plan = action.payload?.plan || action.payload;
        updatePlanInState(state, plan);
      })
      // deleteRescuerPlan
      .addCase(deleteRescuerPlan.fulfilled, (state, action) => {
        state.plans = state.plans.filter((p) => p._id !== action.payload);
        if (state.activePlan?._id === action.payload) state.activePlan = null;
      })
      // log actions that update plan
      .addCase(logDailyConsumption.fulfilled, (state, action) => {
        const plan = action.payload?.plan || action.payload;
        updatePlanInState(state, plan);
      })
      .addCase(logExtraConsumption.fulfilled, (state, action) => {
        const plan = action.payload?.plan || action.payload;
        updatePlanInState(state, plan);
      })
      .addCase(logUrgeResisted.fulfilled, (state, action) => {
        const plan = action.payload?.plan || action.payload;
        updatePlanInState(state, plan);
      })
      // Cross-slice sync: Tracker usage logged updates active Rescuer plan
      .addCase('tracker/addUsageLog/fulfilled', (state, action) => {
        if (action.payload?.rescuerPlan) {
          updatePlanInState(state, action.payload.rescuerPlan);
        }
      })
      // Cross-slice sync: Dashboard relapse updates active Rescuer plan
      .addCase('addictions/logRelapse/fulfilled', (state, action) => {
        if (action.payload?.rescuerPlan) {
          updatePlanInState(state, action.payload.rescuerPlan);
        }
      })
      // Cross-slice sync: Deleting an addiction deactivates/removes associated plan
      .addCase('addictions/deleteAddiction/fulfilled', (state, action) => {
        const aid = action.payload?.id || action.payload;
        if (aid) {
          state.plans = state.plans.filter((p) => {
            const pAid = p.addictionId?._id || p.addictionId;
            return pAid !== aid;
          });
          const activeAid = state.activePlan?.addictionId?._id || state.activePlan?.addictionId;
          if (activeAid === aid) {
            state.activePlan = null;
          }
        }
      });
  },
});

export const { clearActivePlan } = rescuerSlice.actions;
export default rescuerSlice.reducer;
