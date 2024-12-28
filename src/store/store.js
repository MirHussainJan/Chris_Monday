import { create } from "zustand";

const useMondayStore = create((set) => ({
  boardData: [],
  personProfiles: {},
  teamProfiles: {},

  // Fetch functions
  fetchBoardData: async (fetchFunction, args) => {
    const data = await fetchFunction(...args);
    set({ boardData: data });
  },
  fetchPersonProfile: async (fetchFunction, personId) => {
    const data = await fetchFunction(personId);
    set((state) => ({
      personProfiles: { ...state.personProfiles, [personId]: data },
    }));
  },
  fetchTeamProfile: async (fetchFunction, teamId) => {
    const data = await fetchFunction(teamId);
    set((state) => ({
      teamProfiles: { ...state.teamProfiles, [teamId]: data },
    }));
  },
}));

export default useMondayStore;