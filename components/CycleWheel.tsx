
import React, { useMemo } from 'react';
import * as d3 from 'd3';
import { PHASE_CONFIG, getThemeClasses } from '../constants';
import { CyclePhase, ThemeColor } from '../types';
import { PrivacyMask } from './PrivacyMask';

interface CycleWheelProps {
  currentDay: number;
  cycleLength: number;
  periodLength: number;
  phaseName: string;
  privacyMode: boolean;
  themeColor: ThemeColor;
}

const CycleWheel: React.FC<CycleWheelProps> = ({ currentDay, cycleLength, periodLength, phaseName, privacyMode, themeColor }) => {
  const width = 220;
  const height = 220;
  const radius = Math.min(width, height) / 2;
  const innerRadius = radius - 18;

  const theme = getThemeClasses(themeColor);
  const isLate = currentDay > cycleLength;
  const isNeutral = themeColor === 'neutral';

  const displayDay = isLate ? cycleLength : currentDay;

  const angleScale = d3.scaleLinear()
    .domain([0, cycleLength])
    .range([0, 2 * Math.PI]);

  const segments = useMemo(() => {
    // Scientific Calculation mirroring storageService logic
    const lutealLength = 14;
    const ovulationDay = cycleLength - lutealLength;

    const menstrualStart = 1;
    const menstrualEnd = periodLength;

    const follicularStart = menstrualEnd + 1;
    const fertileStart = ovulationDay - 5; // 6-day fertile window

    const follicularEnd = fertileStart - 1;

    const ovulationStart = fertileStart;
    const ovulationEnd = ovulationDay; // Day of ovulation

    const lutealStart = ovulationDay + 1;
    const lutealEnd = cycleLength;

    const segs = [
      {
        phase: CyclePhase.MENSTRUAL,
        start: menstrualStart,
        end: menstrualEnd,
        config: PHASE_CONFIG[CyclePhase.MENSTRUAL]
      },
      {
        phase: CyclePhase.FOLLICULAR,
        start: follicularStart,
        end: follicularEnd,
        config: PHASE_CONFIG[CyclePhase.FOLLICULAR]
      },
      {
        phase: CyclePhase.OVULATION,
        start: ovulationStart,
        end: ovulationEnd,
        config: PHASE_CONFIG[CyclePhase.OVULATION]
      },
      {
        phase: CyclePhase.LUTEAL,
        start: lutealStart,
        end: lutealEnd,
        config: PHASE_CONFIG[CyclePhase.LUTEAL]
      }
    ];

    // Filter out invalid segments (e.g., if cycle is very short)
    return segs.filter(s => s.start <= s.end);
  }, [cycleLength, periodLength]);

  const arcs = useMemo(() => {
    const arcGenerator = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(6);

    return segments.map((segment) => {
      const startAngle = angleScale(segment.start - 1);
      const endAngle = angleScale(segment.end);

      // Override colors for Privacy Mode / Neutral Theme
      let color = segment.phase === CyclePhase.MENSTRUAL ? '#FF4D8C' : segment.config.color;
      if (isNeutral) {
        switch (segment.phase) {
          case CyclePhase.MENSTRUAL: color = '#334155'; break; // Slate-700
          case CyclePhase.FOLLICULAR: color = '#94a3b8'; break; // Slate-400
          case CyclePhase.OVULATION: color = '#cbd5e1'; break; // Slate-300
          case CyclePhase.LUTEAL: color = '#e2e8f0'; break; // Slate-200
        }
      }

      return {
        path: arcGenerator({
          startAngle: startAngle,
          endAngle: endAngle,
          innerRadius,
          outerRadius: radius,
        } as any),
        color: color,
      };
    });
  }, [angleScale, innerRadius, radius, segments, isNeutral]);

  // Cursor Calculation
  const currentDayAngle = angleScale(displayDay - 0.5) - (Math.PI / 2);
  const cursorRadius = (radius + innerRadius) / 2;
  const cursorX = Math.cos(currentDayAngle) * cursorRadius;
  const cursorY = Math.sin(currentDayAngle) * cursorRadius;

  const trackArc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(radius)
    .startAngle(0)
    .endAngle(2 * Math.PI);

  return (
    <div className="relative flex items-center justify-center py-2">
      <svg width={width} height={height} viewBox={`-${width / 2} -${height / 2} ${width} ${height}`}>
        <path d={trackArc(null as any) || ''} fill={isNeutral ? "#1e293b" : "#F3F4F6"} />

        {arcs.map((arc, i) => (
          <path key={i} d={arc.path || ''} fill={arc.color} stroke={isNeutral ? "#0f172a" : "white"} strokeWidth="2" />
        ))}

        <g transform="rotate(0)">
          <circle
            cx={cursorX}
            cy={cursorY}
            r={16}
            fill={isLate ? "rgba(239, 68, 68, 0.3)" : "rgba(0,0,0,0.1)"}
            className={isLate ? "animate-pulse" : ""}
          />
          <circle
            cx={cursorX}
            cy={cursorY}
            r={14}
            fill={isLate ? "#EF4444" : isNeutral ? "#475569" : "#202020"}
            className="drop-shadow-md"
          />
          <circle
            cx={cursorX}
            cy={cursorY}
            r={11}
            fill={isNeutral ? "#f8fafc" : "white"}
          />
          <text
            x={cursorX}
            y={cursorY}
            dy=".35em"
            textAnchor="middle"
            className={`font-extrabold text-[8px] ${isLate ? 'text-red-500' : theme.text}`}
          >
            {isLate ? '!' : `D${currentDay}`}
          </text>
        </g>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full m-auto" style={{ width: innerRadius * 2, height: innerRadius * 2 }}>
        <div className={`bg-white/60 backdrop-blur-md w-full h-full rounded-full flex flex-col items-center justify-center border-[4px] border-white shadow-sm overflow-hidden relative`}>
          <PrivacyMask isActive={privacyMode} className="flex flex-col items-center justify-center w-full h-full">
            <div className="flex items-center gap-1 mb-0.5">
              <span className={`${isLate ? 'text-red-500 animate-pulse font-black' : 'text-gray-500'} text-xs font-bold`}>
                {isLate ? 'Period Late!' : phaseName}
              </span>
              {!isLate && (
                <div className="group relative">
                  <div className="w-3 h-3 rounded-full bg-gray-100 flex items-center justify-center text-[8px] text-gray-400 font-bold cursor-help">?</div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-32 bg-gray-800 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 leading-tight">
                    Current phase of your cycle.
                  </div>
                </div>
              )}
            </div>

            <span className="text-gray-400 text-[9px] uppercase tracking-widest mb-0">Cycle Day</span>
            <span className={`text-5xl font-black ${isLate ? 'text-red-500' : theme.textDark} tracking-tighter`}>
              {currentDay}
            </span>
            <div className="flex flex-col items-center mt-1">
              <span className="text-gray-400 text-[9px] font-bold">CYCLE LENGTH</span>
              <span className="text-gray-600 text-[10px] font-bold">{cycleLength} Days</span>
            </div>
          </PrivacyMask>
        </div>
      </div>
    </div>
  );
};

export default CycleWheel;
