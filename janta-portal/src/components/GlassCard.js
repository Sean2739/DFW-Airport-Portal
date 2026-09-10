"use client";

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

/**
 * GlassCard - A reusable glassmorphic card component
 * 
 * Props:
 * - children: Card content
 * - className: Additional CSS classes
 * - hoverable: Enable hover animations (default: true)
 * - animated: Add animation on mount (default: false)
 * - onClick: Click handler
 * - style: Inline styles
 * - title: Optional card title
 * - subtitle: Optional card subtitle
 * - icon: Optional icon component
 * - headerAction: Optional action element for header
 */
export default function GlassCard({
  children,
  className = '',
  hoverable = true,
  animated = false,
  onClick,
  style,
  title,
  subtitle,
  icon: Icon,
  headerAction,
}) {
  const { isDark } = useTheme();

  const baseClasses = isDark
    ? 'glass-card-dark'
    : 'glass-card';

  const hoverClasses = hoverable && isDark
    ? 'glass-card-dark-hover'
    : hoverable
    ? 'glass-card-hover'
    : baseClasses;

  const animationClass = animated ? 'animate-float-up' : '';

  return (
    <div
      className={`${hoverClasses} ${animationClass} ${className}`}
      onClick={onClick}
      style={style}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : -1}
    >
      {/* Header Section */}
      {(title || Icon || headerAction) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            {Icon && (
              <div className="flex-shrink-0 mt-1">
                <Icon
                  size={24}
                  className={isDark ? 'text-primary-400' : 'text-primary-600'}
                />
              </div>
            )}
            <div>
              {title && (
                <h3 className={`text-lg font-semibold ${
                  isDark ? 'text-foreground' : 'text-gray-900'
                }`}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {headerAction && (
            <div className="flex-shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className={title || Icon ? 'pt-2' : ''}>
        {children}
      </div>
    </div>
  );
}

/**
 * GlassCardGrid - A wrapper component for displaying multiple cards in a grid
 * 
 * Props:
 * - children: Card components
 * - columns: Number of columns (default: 3, responsive)
 * - gap: Gap between cards (default: 'gap-4')
 */
export function GlassCardGrid({ children, columns = 3, gap = 'gap-4' }) {
  const gridClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid ${gridClass} ${gap}`}>
      {children}
    </div>
  );
}

/**
 * GlassCardSection - A section wrapper for grouping cards with a title
 * 
 * Props:
 * - title: Section title
 * - children: Cards
 * - className: Additional classes
 */
export function GlassCardSection({ title, children, className = '' }) {
  const { isDark } = useTheme();

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h2 className={`text-sm font-semibold uppercase tracking-wider ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
