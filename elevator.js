/**
 * Description of solution.
 * 
 * I built a tree of all possible paths, with each depth child level being a time interval.
 * I then do a depth first search for the final floor at the final depth level (aka time interval). 
 * 
 * Example using the example from the instructions.
 * t=0: Root Node. This is the location of the starting elevator.
 * t=1: Find possible elevators to switch to. The only available elevator is still A. One child node.
 * t=2: Only available elevator is still A. One child node.
 * t=3: Two possible elevators, A & B. Create two child nodes.
 * t=4: The elevator A path only has one possible elevator, to stay on A; create child node of that.
 * t=4: The elevator B path has two possible elevators, B or D; create two child nodes.
 * t=5: Elevator A reaches floor 2; incorrect solution.
 * t=5: Elevator B reaches floor 2; incorrect solution.
 * t=5: Elevator D reaches floor 5; correct solution!
 * 
 * Time Complexity - O(N*M) with N being the number of elevators and M being the number of floors.
 * To build the tree I iterated through each of the elevators for each floor to check to see if it's a possible match.
 * 
 * Space Complexity - O(N*M) worst case scenario, all of the elevator states are very similar.
 * 
 * I didn't think too much about if I can build a faster complexity given the context of this question;
 * I'd assume we wouldn't scale this question to have millions of elevators and millions of floors.
 * 
 * There's definitely a lot of optimizations I can add to this algorithm, let me know if you would like to chat about some.
 * e.g. building out the entire tree is unecessary as the larger the elevatorStates grows, the more possible solutions there will be.
 */

/** Class that's used to instatiate Nodes for a Tree. */
class Node {
  constructor(data) {
    // The data stored in this node.
    this.data = data;

    // An array of child nodes.
    this.children = [];
  }

  addChild(node) {
    this.children.push(node);
  }
}

/** Class that's used to instatiate a new Tree. */
class Tree {
  constructor() {
    this.root = null;
  }

  /**
   * Does a breadth first traversal of the tree, calling the callback on every node.
   * I mainly just used this function to make sure I was building the Tree correctly.
   * 
   * @param {callbackOnNode} callback - calls this callback on every node traversed.
   */
  traverseBreadthFirst(callback) {
    const arrayOfNodesToTraverse = [this.root];
    while (arrayOfNodesToTraverse.length > 0) {
      const currentNode = arrayOfNodesToTraverse.shift();

      // Add the children of the current node to the list of nodes to traverse.
      arrayOfNodesToTraverse.push(...currentNode.children);

      callback(currentNode);
    }
  }
}

// Class that's used to build all possible elevator paths into a Tree.
class ElevatorPathTree extends Tree {
  constructor() {
    super();
  }

  /**
   * Builds all the possible elevator paths given a starting elevator and all the elevator states over time.
   * 
   * @param {object} elevatorStates 
   * @param {string} startingElevator 
   */
  buildElevatorPathTree(elevatorStates, startingElevator) {
    // At t=0, you are located at the root node.
    this.root = new Node({
      elevator: startingElevator,
      floor: elevatorStates[startingElevator][0],
      time: 0
    });

    // List of nodes to iterate when searching for possible children to append.
    const listOfNodes = [this.root];

    // Builds a Tree datastructure where the child nodes are possible elevator switches.
    while (listOfNodes.length > 0) {
      const currentNode = listOfNodes.shift();
      const currentElevator = currentNode.data.elevator;
      const currentTime = currentNode.data.time;

      // We always have the option of staying on the elevator. Add that possibility as a child node.
      const nextFloorSameElevator =
        elevatorStates[currentElevator][currentTime];
      if (nextFloorSameElevator) {
        const childNode = new Node({
          elevator: currentElevator,
          floor: nextFloorSameElevator,
          time: currentTime + 1
        });

        // Add the child node to the Tree
        currentNode.addChild(childNode);

        // Push the child node to the list of nodes so that we can interate over it to finds the child node's children.
        listOfNodes.push(childNode);
      }

      // Search the next time interval for possible elevators to switch to. Add those possibilities as a child node.
      for (const possibleNextElevator in elevatorStates) {
        const possibleNextFloor =
          elevatorStates[possibleNextElevator][currentTime];

        if (
          possibleNextFloor &&
          currentElevator !== possibleNextElevator &&
          nextFloorSameElevator === possibleNextFloor
        ) {
          const childNode = new Node({
            elevator: possibleNextElevator,
            floor: possibleNextFloor,
            time: currentTime + 1
          });

          // Add the child node to the Tree.
          currentNode.addChild(childNode);

          // Push the child node to the list of nodes so that we can interate over it to finds the child node's children.
          listOfNodes.push(childNode);
        }
      }
    }
  }

  /**
   * Does a depth first search to find the final destional.
   * 
   * @params {number} finalFloor - the final floor that we must be located on.
   * @params {number} finalTimeInterval - the time interval in which we need to be on the final floor.
   * @returns a string of the elevator path to reach the final destination, or null if there is no solution.
   */
  findFinalDestinationPath(finalFloor, finalTimeInterval) {
    // Update this variable for each level of child nodes we're currently searching.
    // The finalFloor needs to be found when the currentLevel equals the finalTimeInterval.
    let currentLevel = 0;

    // Stack to keep track of the path. Using an array for convience sake.
    const pathStack = [];

    const arrayOfNodesToTraverse = [this.root];
    while (arrayOfNodesToTraverse.length > 0) {
      const currentNode = arrayOfNodesToTraverse.shift();
      const currentNodeFloor = currentNode.data.floor;
      const currentNodeElevator = currentNode.data.elevator;
      const currentNodeTime = currentNode.data.time;

      if (currentLevel < currentNodeTime) {
        pathStack.push(currentNodeElevator);
        currentLevel = currentNodeTime;
      } else {
        for (let i = 0; i <= currentLevel - currentNodeTime; i++) {
          pathStack.pop();
        }
        pathStack.push(currentNodeElevator);
        currentLevel = currentNodeTime;
      }

      if (currentNodeTime < finalTimeInterval) {
        arrayOfNodesToTraverse.unshift(...currentNode.children);
      }

      if (
        currentLevel === finalTimeInterval &&
        currentNodeFloor === finalFloor
      ) {
        // Strip out the root node.
        return pathStack.join("").substring(1);
      }
    }
    return null;
  }
}

function findElevatorPath(elevatorStates, startingElevator, finalDestination) {
  const pathTree = new ElevatorPathTree();
  pathTree.buildElevatorPathTree(elevatorStates, startingElevator);

  const finalDestinationData = finalDestination.split("-");
  const finalFloor = parseInt(finalDestinationData[0]);
  const finalTimeInterval = parseInt(finalDestinationData[1]);

  const path = pathTree.findFinalDestinationPath(finalFloor, finalTimeInterval);
  return path || "There is no solution";
}

/**
 * Add test cases here. Be sure to also add the testCase object to the array on line 252.
 */

// Tests the elevator states in the instructions.
const testCase1 = {
  elevatorStates: {
    A: [1, 4, 3, 2, 2],
    B: [3, 3, 3, 4, 2],
    C: [2, 2, 6, 6, 6],
    D: [6, 1, 1, 4, 5]
  },
  startingElevator: "A",
  finalDestination: "5-5", // <floor> - <time>
  expectedSolution: "AABDD"
};

// Pushes the algorithm a little harder.
const testCase2 = {
  elevatorStates: {
    A: [1, 7, 7, 7, 5, 2, 1],
    B: [2, 9, 6, 3, 9, 8, 3],
    C: [9, 8, 7, 5, 5, 4, 5],
    D: [2, 1, 3, 4, 8, 1, 2],
    E: [8, 1, 5, 5, 6, 7, 7]
  },
  startingElevator: "B",
  finalDestination: "2-6", // <floor> - <time>
  expectedSolution: "DEECAA"
};

// Should test for impossible solutions. Similar elevator states as testCase2, but it's impossible to get on elevatort A.
const testCase3 = {
  elevatorStates: {
    A: [1, 7, 7, 7, 7, 2, 1],
    B: [2, 9, 6, 3, 9, 8, 3],
    C: [9, 8, 7, 5, 5, 4, 5],
    D: [2, 1, 3, 4, 8, 1, 2],
    E: [8, 1, 5, 5, 6, 7, 7]
  },
  startingElevator: "B",
  finalDestination: "2-6", // <floor> - <time>
  expectedSolution: "There is no solution"
};

// Make sure to add your test cases to this array!
const testCases = [testCase1, testCase2, testCase3];

// Execute the test cases.
testCases.forEach(testCase => {
  console.log(testCase.elevatorStates);
  console.log("Starting Elevator: " + testCase.startingElevator);
  console.log("Final Destination: " + testCase.finalDestination);
  console.log("Expected Solution: " + testCase.expectedSolution);

  const actualSolution = findElevatorPath(
    testCase.elevatorStates,
    testCase.startingElevator,
    testCase.finalDestination
  );
  console.log("Actual Solution: " + actualSolution);
  if (testCase.expectedSolution === actualSolution) {
    console.log("SUCCESS!");
  } else {
    console.log("FAILURE");
  }
  console.log("===============================");
});
