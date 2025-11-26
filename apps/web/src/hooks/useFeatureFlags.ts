/**
 * Feature Flags Hook
 * Use feature flags in React components
 *
 * Usage:
 *   const { isFeatureEnabled, enabledFeatures } = useFeatureFlags();
 *   if (isFeatureEnabled('new-dashboard')) { ... }
 */

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface FeatureFlagsResponse {
  status: string;
  data: {
    features: string[];
    userId?: string;
    userRole?: string;
  };
}

/**
 * Fetch enabled features from API
 */
async function fetchEnabledFeatures(): Promise<string[]> {
  try {
    const response = await axios.get<FeatureFlagsResponse>(
      `${API_URL}/api/feature-flags/enabled`,
      { withCredentials: true }
    );

    return response.data.data.features;
  } catch (error) {
    console.error('Failed to fetch feature flags:', error);
    return []; // Return empty array on error (all features disabled)
  }
}

/**
 * Feature Flags Hook
 * @returns Object with feature flag utilities
 */
export function useFeatureFlags() {
  const { data: enabledFeatures = [], isLoading, error } = useQuery({
    queryKey: ['featureFlags'],
    queryFn: fetchEnabledFeatures,
    staleTime: 60000, // 1 minute
    cacheTime: 300000, // 5 minutes
    retry: 2,
  });

  /**
   * Check if a feature is enabled
   * @param featureName - Name of the feature
   * @returns Whether the feature is enabled
   */
  const isFeatureEnabled = (featureName: string): boolean => {
    return enabledFeatures.includes(featureName);
  };

  /**
   * Check if any of the given features are enabled
   * @param featureNames - Array of feature names
   * @returns Whether any feature is enabled
   */
  const isAnyFeatureEnabled = (...featureNames: string[]): boolean => {
    return featureNames.some(name => enabledFeatures.includes(name));
  };

  /**
   * Check if all of the given features are enabled
   * @param featureNames - Array of feature names
   * @returns Whether all features are enabled
   */
  const areAllFeaturesEnabled = (...featureNames: string[]): boolean => {
    return featureNames.every(name => enabledFeatures.includes(name));
  };

  return {
    enabledFeatures,
    isFeatureEnabled,
    isAnyFeatureEnabled,
    areAllFeaturesEnabled,
    isLoading,
    error,
  };
}

/**
 * Feature Flag Component
 * Conditionally render children based on feature flag
 *
 * Usage:
 *   <FeatureFlag name="new-dashboard">
 *     <NewDashboard />
 *   </FeatureFlag>
 *
 *   <FeatureFlag name="beta-feature" fallback={<OldFeature />}>
 *     <BetaFeature />
 *   </FeatureFlag>
 */
interface FeatureFlagProps {
  name: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureFlag({ name, children, fallback = null }: FeatureFlagProps) {
  const { isFeatureEnabled, isLoading } = useFeatureFlags();

  // Don't render anything while loading
  if (isLoading) {
    return null;
  }

  // Render children if feature is enabled, fallback otherwise
  return isFeatureEnabled(name) ? <>{children}</> : <>{fallback}</>;
}

/**
 * Higher-Order Component for feature flags
 * Wrap a component to only render when feature is enabled
 *
 * Usage:
 *   const NewDashboard = withFeatureFlag('new-dashboard')(DashboardComponent);
 */
export function withFeatureFlag(featureName: string) {
  return function <P extends object>(Component: React.ComponentType<P>) {
    return function FeatureFlaggedComponent(props: P) {
      const { isFeatureEnabled, isLoading } = useFeatureFlags();

      if (isLoading) {
        return null;
      }

      if (!isFeatureEnabled(featureName)) {
        return null;
      }

      return <Component {...props} />;
    };
  };
}
