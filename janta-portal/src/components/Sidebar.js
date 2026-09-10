'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LayoutDashboard, BarChart3, Sliders, History, ChevronRight } from 'lucide-react';
import { ICON_STROKE, ICON_MD } from '@/lib/icons';
import { useTheme } from '@/context/ThemeContext';
import { getFifaSidebarColors } from '@/lib/fifaDashboardTheme';
import { getDfwSidebarColors } from '@/lib/dfwDashboardTheme';

export const SIDEBAR_COLLAPSED_W = 64;
export const SIDEBAR_EXPANDED_W = 200;
/** Matches dashboard header `h-14` so back-row border lines up with topbar */
export const TOPBAR_HEIGHT = 56;

const Sidebar = ({ activeSection, onSectionChange, systemName, isNarrow = false, branding = 'default' }) => {
  const router = useRouter();
  const navItems = [
    { id: 'dashboard',   label: 'Dashboard',      icon: LayoutDashboard },
    { id: 'control',     label: 'Control',         icon: Sliders },
    { id: 'diagnostics', label: 'Diagnostics',     icon: BarChart3 },
    { id: 'historical',  label: 'Historical Data', icon: History },
  ];

  const { isDark } = useTheme();
  const [hoveredId, setHoveredId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lockCollapsed, setLockCollapsed] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (!isExpanded) return;
    function handlePointerDown(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsExpanded(false);
        setHoveredId(null);
        setLockCollapsed(false);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isExpanded]);

  function expandFromHover() {
    if (lockCollapsed) return;
    setIsExpanded(true);
  }

  function toggleExpanded() {
    if (isExpanded) {
      setIsExpanded(false);
      setLockCollapsed(true);
      return;
    }
    setIsExpanded(true);
    setLockCollapsed(false);
  }

  const isFifa = branding === 'fifa';
  const isDfw = branding === 'dfw';
  const brandedRaw = isFifa ? getFifaSidebarColors(isDark) : isDfw ? getDfwSidebarColors(isDark) : null;
  const DK = brandedRaw
    ? {
        ...brandedRaw,
        amber: brandedRaw.accent,
        amberDim: brandedRaw.accentDim,
        navHoverBg: brandedRaw.navHoverBg ?? 'rgba(255,255,255,0.04)',
        iconActive: brandedRaw.iconActive ?? brandedRaw.accent,
        iconIdle: brandedRaw.iconIdle ?? brandedRaw.text3,
        activeBoxShadow: brandedRaw.activeGlow ?? '0 0 16px rgba(230,184,92,0.08)',
      }
    : {
        bg:      '#0c0c0d',
        surface: '#161618',
        border:  'rgba(255,255,255,0.08)',
        text1:   '#f4f4f5',
        text2:   'rgba(244,244,245,0.80)',
        text3:   'rgba(244,244,245,0.58)',
        amber:   '#e6b85c',
        amberDim:'rgba(230,184,92,0.12)',
      };
  const sidebarBg = brandedRaw ? brandedRaw.bg : (isDark ? DK.bg : '#1A2535');

  function handleBack() {
    router.push('/systemselect');
  }

  if (isNarrow) {
    return (
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 py-2"
        style={{
          background: sidebarBg,
          borderTop: isDark ? '0.5px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,220,150,0.12)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.25)',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 4, padding: '6px 16px', borderRadius: 10, border: 'none',
                cursor: 'pointer', minWidth: 56,
                background: isActive ? 'rgba(230,184,92,0.15)' : 'transparent',
              }}
            >
              <Icon style={{
                width: 20, height: 20,
                color: isActive ? '#e6b85c' : 'rgba(244,244,245,0.4)',
              }} />
            </button>
          );
        })}
      </nav>
    );
  }

  const sidebarWidth = isExpanded ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W;

  return (
    <aside
      ref={sidebarRef}
      className="fixed left-0 top-0 bottom-0 flex flex-col overflow-hidden"
      onMouseEnter={expandFromHover}
      onMouseLeave={() => {
        setIsExpanded(false);
        setHoveredId(null);
        setLockCollapsed(false);
      }}
      style={{
        width: sidebarWidth,
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease',
        background: sidebarBg,
        borderRight: brandedRaw || isDark ? `0.5px solid ${DK.border}` : 'none',
        boxShadow: isExpanded
          ? (isDfw && isDark
            ? '4px 0 28px rgba(0,0,0,0.45), 0 0 44px rgba(255,80,0,0.12)'
            : isFifa && isDark
            ? '4px 0 28px rgba(0,45,48,0.40), 0 0 44px rgba(240,78,35,0.08)'
            : isDark ? '4px 0 24px rgba(0,0,0,0.45)' : '4px 0 24px rgba(0,0,0,0.35)')
          : (isDfw && isDark
            ? '2px 0 18px rgba(0,0,0,0.40), 0 0 28px rgba(255,80,0,0.10)'
            : isFifa && isDark
            ? '2px 0 18px rgba(0,45,48,0.32), 0 0 28px rgba(0,75,77,0.18)'
            : isDark ? 'none' : '2px 0 12px rgba(0,0,0,0.2)'),
        zIndex: isExpanded ? 40 : 30,
      }}
    >
      {/* Back — height matches main topbar so borders align */}
      <div
        style={{
          height: TOPBAR_HEIGHT,
          boxSizing: 'border-box',
          borderBottom: isDark ? `0.5px solid ${DK.border}` : '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          title="Go back"
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            padding: 0,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: isDark ? DK.text2 : 'rgba(244,244,245,0.7)',
            transition: 'background 0.2s ease, color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)';
            e.currentTarget.style.color = isDark ? DK.text1 : 'rgba(244,244,245,0.95)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = isDark ? DK.text2 : 'rgba(244,244,245,0.7)';
          }}
        >
          <span
            style={{
              width: SIDEBAR_COLLAPSED_W,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowLeft size={ICON_MD} strokeWidth={ICON_STROKE} />
          </span>
          <span style={{
            fontSize: 13,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            opacity: isExpanded ? 1 : 0,
            width: isExpanded ? 'auto' : 0,
            overflow: 'hidden',
            transition: 'opacity 0.2s ease',
          }}>
            Back
          </span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col py-2 gap-1 flex-1" style={{ overflowY: 'auto', overflowX: 'hidden' }}>

        {navItems.map((item) => {
          const Icon  = item.icon;
          const isActive  = activeSection === item.id;
          const isHovered = hoveredId === item.id;

          if (isDark) {
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                title={!isExpanded ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 0',
                  borderRadius: 10,
                  cursor: 'pointer',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? DK.text1 : isHovered ? DK.text1 : DK.text2,
                  background: isActive
                    ? DK.amberDim
                    : isHovered
                    ? (DK.navHoverBg ?? 'rgba(255,255,255,0.04)')
                    : 'transparent',
                  boxShadow: isActive
                    ? (DK.activeBoxShadow ?? '0 0 16px rgba(230,184,92,0.08)')
                    : isHovered
                    ? '0 0 10px rgba(230,184,92,0.04)'
                    : 'none',
                  transition: 'all 0.22s ease',
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    width: SIDEBAR_COLLAPSED_W,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon
                    size={ICON_MD}
                    strokeWidth={ICON_STROKE}
                    style={{
                    flexShrink: 0,
                    color: isActive
                      ? (DK.iconActive ?? DK.amber)
                      : isHovered ? DK.text1 : (DK.iconIdle ?? DK.text3),
                    transform: isActive ? 'scale(1.1)' : isHovered ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.2s ease, color 0.2s ease',
                  }} />
                </span>

                <span style={{
                  whiteSpace: 'nowrap',
                  opacity: isExpanded ? 1 : 0,
                  width: isExpanded ? 'auto' : 0,
                  overflow: 'hidden',
                  transition: 'opacity 0.2s ease',
                }}>
                  {item.label}
                </span>

                {isActive && isExpanded && (
                  <span style={{
                    position: 'absolute',
                    right: 12,
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: DK.amber,
                    boxShadow: `0 0 6px ${DK.amber}`,
                    opacity: 0.85,
                  }} />
                )}
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              title={!isExpanded ? item.label : undefined}
              className="relative overflow-hidden group text-left w-full"
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '10px 0',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                color: isActive ? 'rgb(254 243 199)' : 'rgba(254, 243, 199, 0.6)',
                background: isActive ? 'rgba(230,184,92,0.15)' : isHovered ? 'rgba(255,255,255,0.08)' : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <span
                style={{
                  width: SIDEBAR_COLLAPSED_W,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon style={{
                  width: 18, height: 18, flexShrink: 0,
                  color: isActive ? '#fcd34d' : 'rgba(254, 243, 199, 0.5)',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.2s ease',
                }} />
              </span>
              <span style={{
                whiteSpace: 'nowrap',
                opacity: isExpanded ? 1 : 0,
                width: isExpanded ? 'auto' : 0,
                overflow: 'hidden',
                transition: 'opacity 0.2s ease',
              }}>
                {item.label}
              </span>
              {isActive && isExpanded && (
                <span className="absolute right-3 w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </nav>

      <div
        className="shrink-0 flex items-center"
        style={{
          padding: isExpanded ? '12px 12px 12px 0' : '10px 0',
          borderTop: isDark ? `0.5px solid ${DK.border}` : '1px solid rgba(255,255,255,0.1)',
          background: isDark ? 'transparent' : 'rgba(255,255,255,0.05)',
          overflow: 'hidden',
          minHeight: 56,
        }}
      >
        <button
          type="button"
          onClick={toggleExpanded}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          title={isExpanded ? 'Collapse' : 'Expand'}
          style={{
            width: SIDEBAR_COLLAPSED_W,
            flexShrink: 0,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: isDark ? DK.text2 : 'rgba(244,244,245,0.7)',
          }}
        >
          <ChevronRight
            size={ICON_MD}
            strokeWidth={ICON_STROKE}
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>
        {isExpanded && (
          <p
            className="truncate min-w-0 flex-1 pr-3"
            title={systemName || 'System'}
            style={{
              color: DK.text1,
              fontSize: 12,
              fontWeight: 600,
              lineHeight: 1.3,
              letterSpacing: '0.01em',
              margin: 0,
            }}
          >
            {systemName || 'System'}
          </p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
