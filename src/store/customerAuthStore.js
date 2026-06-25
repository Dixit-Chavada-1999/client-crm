import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCustomerAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,

            setAuth: (user, accessToken, refreshToken) => {
                set({
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                });
            },

            updateAccessToken: (accessToken) => {
                set({ accessToken });
            },

            updateUser: (userData) => {
                set({ user: { ...get().user, ...userData } });
            },

            logout: () => {
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                });
            },

            hasPermission: (permission) => {
                const { user } = get();
                if (!user || !user.permissions) return false;
                return user.permissions[permission] === true;
            },
        }),
        {
            name: 'customer-auth-storage',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useCustomerAuthStore;
