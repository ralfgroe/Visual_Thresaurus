import { useEffect, useRef, useCallback, useState } from 'react';
import ForceGraph3DLib from '3d-force-graph';
import { SpriteText } from './SpriteText';
import { useGraph } from '../hooks/useGraphStore';
import { POS_COLORS } from '../lib/types';
import type { WordNode, WordEdge } from '../lib/types';

interface Props {
  onNodeClick: (word: string) => void;
  onNodeHover: (node: WordNode | null, screenPos: { x: number; y: number } | null) => void;
}

interface GraphNode extends WordNode {
  x?: number;
  y?: number;
  z?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  relation: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ForceGraph3DComponent({ onNodeClick, onNodeHover }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const graphData = useGraph();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const isUserInteracting = useRef(false);
  const interactionTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const onNodeClickRef = useRef(onNodeClick);
  onNodeClickRef.current = onNodeClick;
  const onNodeHoverRef = useRef(onNodeHover);
  onNodeHoverRef.current = onNodeHover;

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!containerRef.current || graphRef.current) return;

    const graph: any = new ForceGraph3DLib(containerRef.current);

    graph
      .backgroundColor('rgba(0,0,0,0)')
      .showNavInfo(false)
      .linkSource('source')
      .linkTarget('target')
      .nodeId('id')
      .linkColor((link: GraphLink) => {
        if (link.relation === 'antonym') return 'rgba(248,113,113,0.5)';
        if (link.relation === 'synonym') return 'rgba(148,163,184,0.35)';
        return 'rgba(148,163,184,0.18)';
      })
      .linkWidth((link: GraphLink) => link.relation === 'synonym' ? 1 : 0.4)
      .linkOpacity(0.8)
      .linkDirectionalParticles((link: GraphLink) => link.relation === 'antonym' ? 2 : 0)
      .linkDirectionalParticleWidth(1.5)
      .linkDirectionalParticleSpeed(0.006)
      .linkDirectionalParticleColor(() => 'rgba(248,113,113,0.6)')
      .nodeThreeObject((node: GraphNode) => {
        return SpriteText(
          node.word,
          POS_COLORS[node.partOfSpeech] || POS_COLORS.other,
          false,
          node.explored,
        );
      })
      .nodeThreeObjectExtend(false)
      .onNodeClick((node: GraphNode) => {
        onNodeClickRef.current(node.word);
      })
      .onNodeHover((node: GraphNode | null) => {
        if (containerRef.current) {
          containerRef.current.style.cursor = node ? 'pointer' : 'default';
        }
        if (node) {
          const coords = graph.graph2ScreenCoords(node.x || 0, node.y || 0, node.z || 0);
          onNodeHoverRef.current(node, { x: coords.x, y: coords.y });
        } else {
          onNodeHoverRef.current(null, null);
        }
      })
      .d3AlphaDecay(0.03)
      .d3VelocityDecay(0.4)
      .warmupTicks(80)
      .cooldownTicks(150);

    const chargeForce = graph.d3Force('charge');
    if (chargeForce?.strength) chargeForce.strength(-60);

    const linkForce = graph.d3Force('link');
    if (linkForce?.distance) linkForce.distance(30);

    graph.width(dimensions.width).height(dimensions.height);

    const markInteracting = () => {
      isUserInteracting.current = true;
      if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
      interactionTimeout.current = setTimeout(() => {
        isUserInteracting.current = false;
      }, 4000);
    };

    containerRef.current.addEventListener('mousedown', markInteracting);
    containerRef.current.addEventListener('wheel', markInteracting);
    containerRef.current.addEventListener('touchstart', markInteracting, { passive: true });

    graphRef.current = graph;

    return () => {
      graph._destructor();
      graphRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!graphRef.current) return;
    graphRef.current.width(dimensions.width).height(dimensions.height);
  }, [dimensions]);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;

    const centerId = graphData.centerNodeId;

    graph.nodeThreeObject((node: GraphNode) => {
      const isCenter = node.id === centerId;
      return SpriteText(
        node.word,
        POS_COLORS[node.partOfSpeech] || POS_COLORS.other,
        isCenter,
        node.explored,
      );
    });

    const links: GraphLink[] = graphData.edges.map((e: WordEdge) => ({
      source: e.source,
      target: e.target,
      relation: e.relation,
    }));

    graph.graphData({
      nodes: graphData.nodes.map((n: WordNode) => {
        const copy: any = { ...n };
        if (n.id === centerId) {
          copy.fx = 0;
          copy.fy = 0;
          copy.fz = 0;
        }
        return copy;
      }),
      links,
    });

    if (centerId) {
      graph.cameraPosition({ x: 0, y: 0, z: 120 }, { x: 0, y: 0, z: 0 }, 800);

      const controls = graph.controls();
      if (controls && 'target' in controls) {
        controls.target.set(0, 0, 0);
      }
    }
  }, [graphData]);

  const animateRotation = useCallback(() => {
    const graph = graphRef.current;
    if (!graph || isUserInteracting.current || !graphData.nodes.length) return;

    const controls = graph.controls();
    if (controls && 'autoRotate' in controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
    }
  }, [graphData.nodes.length]);

  useEffect(() => {
    animateRotation();
  }, [animateRotation]);

  useEffect(() => {
    const interval = setInterval(() => {
      const graph = graphRef.current;
      if (!graph) return;
      const controls = graph.controls();
      if (controls && 'autoRotate' in controls) {
        controls.autoRotate = !isUserInteracting.current && graphData.nodes.length > 0;
      }
    }, 500);
    return () => clearInterval(interval);
  }, [graphData.nodes.length]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, #1e293b 0%, #0f172a 70%)',
      }}
    />
  );
}
