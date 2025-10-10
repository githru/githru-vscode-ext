import React from 'react';
import type { ReleaseContributorActivity, ReleaseFlowLineData } from "./FolderActivityFlow.type";

const DIMENSIONS = {
  width: 800,
  height: 400,
  margin: { top: 40, right: 120, bottom: 60, left: 20 },
};

export interface ReleaseGroup {
  releaseTag: string;
  commitCount: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  commits: any[];
}

const ServerSideFolderActivityFlow = ({
  releaseGroups,
  releaseTopFolderPaths,
  flowLineData,
  releaseContributorActivities,
  firstNodesByContributor,
}: {
  releaseGroups: ReleaseGroup[];
  releaseTopFolderPaths: string[];
  flowLineData: ReleaseFlowLineData[];
  releaseContributorActivities: ReleaseContributorActivity[];
  firstNodesByContributor: Map<string, any>;
}) => {
  
  const createPureSVG = (): string => {
    // 데이터 준비
    const uniqueReleases = Array.from(new Set(releaseContributorActivities.map(a => a.releaseIndex))).sort((a, b) => a - b);
    const releaseTagsByIndex = new Map<number, string>();
    releaseContributorActivities.forEach(a => {
      releaseTagsByIndex.set(a.releaseIndex, a.releaseTag);
    });

    // 스케일 계산
    const xRange = DIMENSIONS.width - DIMENSIONS.margin.left - DIMENSIONS.margin.right;
    const yRange = DIMENSIONS.height - DIMENSIONS.margin.top - DIMENSIONS.margin.bottom;
    
    const xBandwidth = xRange / uniqueReleases.length;
    const yBandwidth = yRange / releaseTopFolderPaths.length;

    // 색상 팔레트
    const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#e67e22'];
    const contributorNames = Array.from(new Set(releaseContributorActivities.map(a => a.contributorName)));
    const colorMap = new Map<string, string>();
    contributorNames.forEach((name, index) => {
      colorMap.set(name, colors[index % colors.length]);
    });

    // 최대 변경량 계산
    const maxChanges = Math.max(...releaseContributorActivities.map(d => d.changes));

    // SVG 요소 생성
    let svgElements = '';

    // 폴더 레인 그리기
    releaseTopFolderPaths.forEach((folderPath, index) => {
      const y = DIMENSIONS.margin.top + index * yBandwidth;
      const folderName = folderPath === "." ? "📁 root" : `📁 ${folderPath.split('/').pop() || folderPath}`;
      
      svgElements += `
        <rect x="${DIMENSIONS.margin.left}" y="${y}" width="${xRange}" height="${yBandwidth}" 
              fill="#ffffff" stroke="#dee2e6" stroke-width="1" rx="4"/>
        <text x="${DIMENSIONS.width - DIMENSIONS.margin.right + 10}" y="${y + yBandwidth/2}" 
              text-anchor="start" dominant-baseline="middle" 
              style="font-size: 12px; fill: #495057; font-weight: 500;">${folderName}</text>
      `;
    });

    // 릴리즈 축 그리기
    uniqueReleases.forEach((releaseIndex, index) => {
      const x = DIMENSIONS.margin.left + index * xBandwidth + xBandwidth / 2;
      const releaseTag = releaseTagsByIndex.get(releaseIndex) || `Release ${releaseIndex}`;
      
      svgElements += `
        <line x1="${x}" y1="${DIMENSIONS.height - DIMENSIONS.margin.bottom}" 
              x2="${x}" y2="${DIMENSIONS.height - DIMENSIONS.margin.bottom + 10}" 
              stroke="#6c757d" stroke-width="1"/>
        <text x="${x}" y="${DIMENSIONS.height - DIMENSIONS.margin.bottom + 25}" 
              text-anchor="middle" style="font-size: 11px; fill: #6c757d;">${releaseTag}</text>
      `;
    });

    // 활동 노드 그리기
    releaseContributorActivities.forEach(activity => {
      const folderIndex = releaseTopFolderPaths.indexOf(activity.folderPath);
      const releaseIndex = uniqueReleases.indexOf(activity.releaseIndex);
      
      if (folderIndex === -1 || releaseIndex === -1) return;

      const x = DIMENSIONS.margin.left + releaseIndex * xBandwidth + xBandwidth / 2;
      const y = DIMENSIONS.margin.top + folderIndex * yBandwidth + yBandwidth / 2;
      
      // 노드 크기 계산 (4-16px 범위)
      const radius = 4 + (activity.changes / maxChanges) * 12;
      const color = colorMap.get(activity.contributorName) || '#3498db';
      
      svgElements += `
        <circle cx="${x}" cy="${y}" r="${radius}" 
                fill="${color}" fill-opacity="0.8" stroke="#fff" stroke-width="2"/>
      `;
    });

    // 첫 번째 노드에 기여자 이름 표시
    Array.from(firstNodesByContributor.values()).forEach(activity => {
      const folderIndex = releaseTopFolderPaths.indexOf(activity.folderPath);
      const releaseIndex = uniqueReleases.indexOf(activity.releaseIndex);
      
      if (folderIndex === -1 || releaseIndex === -1) return;

      const x = DIMENSIONS.margin.left + releaseIndex * xBandwidth + xBandwidth / 2;
      const y = DIMENSIONS.margin.top + folderIndex * yBandwidth + yBandwidth / 2;
      const radius = 4 + (activity.changes / maxChanges) * 12;
      
      svgElements += `
        <text x="${x}" y="${y - radius - 8}" text-anchor="middle" dominant-baseline="bottom" 
              style="font-size: 10px; fill: #495057; font-weight: 500;">${activity.contributorName}</text>
      `;
    });

    // 플로우 라인 그리기
    flowLineData.forEach(flow => {
      const startFolderIndex = releaseTopFolderPaths.indexOf(flow.startFolder);
      const endFolderIndex = releaseTopFolderPaths.indexOf(flow.endFolder);
      const startReleaseIndex = uniqueReleases.indexOf(flow.startReleaseIndex);
      const endReleaseIndex = uniqueReleases.indexOf(flow.endReleaseIndex);
      
      if (startFolderIndex === -1 || endFolderIndex === -1 || startReleaseIndex === -1 || endReleaseIndex === -1) return;

      const x1 = DIMENSIONS.margin.left + startReleaseIndex * xBandwidth + xBandwidth / 2;
      const y1 = DIMENSIONS.margin.top + startFolderIndex * yBandwidth + yBandwidth / 2;
      const x2 = DIMENSIONS.margin.left + endReleaseIndex * xBandwidth + xBandwidth / 2;
      const y2 = DIMENSIONS.margin.top + endFolderIndex * yBandwidth + yBandwidth / 2;
      
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      
      const color = colorMap.get(flow.contributorName) || '#3498db';
      
      svgElements += `
        <path d="M ${x1},${y1} Q ${midX},${y1} ${midX},${midY} Q ${midX},${y2} ${x2},${y2}" 
              fill="none" stroke="${color}" stroke-width="2" stroke-opacity="0.4"/>
      `;
    });

    return `
      <svg width="${DIMENSIONS.width}" height="${DIMENSIONS.height}" 
           style="background: #f8f9fa; border-radius: 8px;">
        ${svgElements}
      </svg>
    `;
  };

  const svgContent = createPureSVG();

  return React.createElement('div', {
    style: {
      padding: '24px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }
  }, [
    React.createElement('h1', {
      key: 'title',
      style: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#2c3e50',
        marginBottom: '16px',
        textAlign: 'center',
        borderBottom: '3px solid #3498db',
        paddingBottom: '16px'
      }
    }, '📊 Contributors Folder Activity Flow'),
    
    React.createElement('p', {
      key: 'subtitle',
      style: {
        textAlign: 'center',
        color: '#6c757d',
        marginBottom: '24px',
        fontSize: '16px'
      }
    }, 'D3-powered visualization of contributors moving between folders across releases'),
    
    React.createElement('div', {
      key: 'chart',
      dangerouslySetInnerHTML: { __html: svgContent }
    }),
    
    React.createElement('div', {
      key: 'legend',
      style: {
        marginTop: '20px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }
    }, [
      React.createElement('h3', {
        key: 'legend-title',
        style: { fontSize: '16px', marginBottom: '12px', color: '#2c3e50' }
      }, '📊 Chart Legend'),
      React.createElement('div', {
        key: 'legend-content',
        style: { fontSize: '14px', color: '#6c757d', lineHeight: '1.6' }
      }, [
        React.createElement('div', { key: 'legend-1' }, '• Circle size represents activity volume (changes)'),
        React.createElement('div', { key: 'legend-2' }, '• Colors represent different contributors'),
        React.createElement('div', { key: 'legend-3' }, '• Curved lines show contributor movement between releases'),
        React.createElement('div', { key: 'legend-4' }, '• Horizontal lanes represent folder paths'),
        React.createElement('div', { key: 'legend-5' }, '• X-axis shows release timeline')
      ])
    ])
  ]);
};

export default ServerSideFolderActivityFlow;



