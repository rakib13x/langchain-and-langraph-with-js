import {
  StateGraph,
  StateType,
  Annotation,
  messagesStateReducer,
  START,
  END,
} from "@langchain/langgraph";
const State = {
  /**
   * The State defines three things:
   * 1. The structure of the graph's state (which "channels" are available to
   * read/write)
   * 2. The default values for the state's channels
   * 3. The reducers for the state's channels. Reducers are functions that
   * determine how to apply updates to the state. Below, new messages are
   * appended to the messages array.
   */
  messages: Annotation({
    reducer: messagesStateReducer,
    default: () => [],
  }),
};
const builder = new StateGraph(State);
