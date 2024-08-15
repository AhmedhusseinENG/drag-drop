import { useState, useEffect } from "react";
import { Container, Button, Modal } from "react-bootstrap";
import { Rnd } from "react-rnd";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag } from "react-dnd";
import "./App.css";

// Only if I had more time I would separate the components using props to make the code cleaner and more organized, Thank you .

const ItemTypes = {
  CARD: "card",
};

//  this is not error it only refer to checking  types of recieved inputs
const Card = ({ id, text, onShowMore, onConnect, updatePosition }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: { id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <Rnd
      id={`card-${id}`}
      default={{
        x: Math.random() * 400,
        y: Math.random() * 400,
        width: 200,
        height: 100,
      }}
      onDragStop={(e, d) => updatePosition(id, d.x, d.y)}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div ref={drag} className="card" style={{ position: "relative" }}>
        <p>{text.slice(0, 26)}...</p>
        <Button onClick={() => onShowMore(text)}>Show More</Button>
        <div
          id={`connection-point-${id}`}
          className="connection-point"
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: "black",
            position: "absolute",
            left: "50%",
            top: "-12px",
            cursor: "pointer",
            padding: "5px",
          }}
          onClick={() => onConnect(id)}
        />
      </div>
    </Rnd>
  );
};

const Canvas = () => {
  const [cards, setCards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [connections, setConnections] = useState([]);
  const [arrows, setArrows] = useState([]);
  const [positions, setPositions] = useState({});

  const addCard = () => {
    const newId =
      cards.length > 0 ? Math.max(...cards.map((card) => card.id)) + 1 : 0;
    setCards([
      ...cards,
      { id: newId, text: `Card ${newId + 1} - This is some dummy text.` },
    ]);
  };

  const handleShowMore = (text) => {
    setModalText(text);
    setShowModal(true);
  };

  const updatePosition = (id, x, y) => {
    setPositions((prev) => ({ ...prev, [id]: { x, y } }));
  };

  const handleConnect = (id) => {
    if (connections.length === 0) {
      setConnections([id]);
    } else {
      const startId = connections[0];
      if (startId !== id) {
        setConnections([]);
        drawArrow(startId, id);
      }
    }
  };

  const drawArrow = (startId, endId) => {
    const startPointEl = document.getElementById(`connection-point-${startId}`);
    const endPointEl = document.getElementById(`connection-point-${endId}`);

    if (startPointEl && endPointEl) {
      const startRect = startPointEl.getBoundingClientRect();
      const endRect = endPointEl.getBoundingClientRect();

      const startPoint = {
        x: startRect.left + startRect.width / 2,
        y: startRect.top + startRect.height / 2,
      };
      const endPoint = {
        x: endRect.left + endRect.width / 2,
        y: endRect.top + endRect.height / 2,
      };

      setArrows((prevArrows) => [
        ...prevArrows,
        { startId, endId, startPoint, endPoint },
      ]);
    }
  };

  useEffect(() => {
    const updatedArrows = arrows.map((arrow) => {
      const startPointEl = document.getElementById(
        `connection-point-${arrow.startId}`
      );
      const endPointEl = document.getElementById(
        `connection-point-${arrow.endId}`
      );

      if (startPointEl && endPointEl) {
        const startRect = startPointEl.getBoundingClientRect();
        const endRect = endPointEl.getBoundingClientRect();

        const startPoint = {
          x: startRect.left + startRect.width / 2,
          y: startRect.top + startRect.height / 2,
        };
        const endPoint = {
          x: endRect.left + endRect.width / 2,
          y: endRect.top + endRect.height / 2,
        };

        return { ...arrow, startPoint, endPoint };
      }

      return arrow;
    });

    setArrows(updatedArrows);
  }, [positions]);

  return (
    <Container
      className="canvas"
      style={{ height: "600px", overflow: "scroll", position: "relative" }}
    >
      <Button onClick={addCard} style={{ position: "relative", zIndex: 2000 }}>
        Add Card
      </Button>
      {cards.map((card) => (
        <Card
          key={card.id}
          id={card.id}
          text={card.text}
          onShowMore={handleShowMore}
          onConnect={handleConnect}
          updatePosition={updatePosition}
        />
      ))}

      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -100,
          pointerEvents: "none",
        }}
      >
        {arrows.map((arrow, index) => (
          <line
            key={index}
            x1={arrow.startPoint.x}
            y1={arrow.startPoint.y}
            x2={arrow.endPoint.x}
            y2={arrow.endPoint.y}
            stroke="black"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
        ))}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="7.5"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="black" />
          </marker>
        </defs>
      </svg>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Card Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalText}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

const App = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <Canvas />
      </div>
    </DndProvider>
  );
};

export default App;
