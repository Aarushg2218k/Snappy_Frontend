import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap"; // Import Bootstrap components
import Robot from "../assets/robot.gif";

export default function Welcome() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUserName = async () => {
      const user = await JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
      if (user) {
        setUserName(user.username);
      }
    };
    fetchUserName();
  }, []);

  return (
    <Container className="text-center text-white d-flex flex-column justify-content-center align-items-center" fluid>
      <Row>
        <Col>
          <img src={Robot} alt="robot" className="mb-4" style={{ height: "20rem" }} />
        </Col>
      </Row>
      <Row>
        <Col>
          <h1>
            Welcome, <span className="text-primary">{userName}!</span>
          </h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <h3>Please select a chat to Start messaging.</h3>
        </Col>
      </Row>
    </Container>
  );
}
