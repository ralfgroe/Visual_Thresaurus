import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import type { GraphData, WordNode, WordEdge } from '../lib/types';
import { mergeGraph } from '../lib/graphUtils';

type Action =
  | { type: 'EXPAND'; nodes: WordNode[]; edges: WordEdge[]; centerId: string }
  | { type: 'SET_CENTER'; centerId: string }
  | { type: 'CLEAR' };

const initialState: GraphData = {
  nodes: [],
  edges: [],
  centerNodeId: null,
};

function graphReducer(state: GraphData, action: Action): GraphData {
  switch (action.type) {
    case 'EXPAND':
      return mergeGraph(state, action.nodes, action.edges, action.centerId);
    case 'SET_CENTER':
      return { ...state, centerNodeId: action.centerId };
    case 'CLEAR':
      return initialState;
    default:
      return state;
  }
}

const GraphContext = createContext<GraphData>(initialState);
const DispatchContext = createContext<Dispatch<Action>>(() => {});

export function GraphProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(graphReducer, initialState);
  return (
    <GraphContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </GraphContext.Provider>
  );
}

export function useGraph() {
  return useContext(GraphContext);
}

export function useGraphDispatch() {
  return useContext(DispatchContext);
}
