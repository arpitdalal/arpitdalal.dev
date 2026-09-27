import { type Config } from '@react-router/dev/config'

export default {
	// In v8 the future.v8_splitRouteModules flag moved here and defaults to
	// true. v8_viteEnvironmentApi is gone because the Vite Environment API is
	// now always on.
	splitRouteModules: true,
	future: {
		unstable_optimizeDeps: true,
	},
} satisfies Config
