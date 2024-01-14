import { useState } from 'react';

import { toast } from "react-toastify";
import copy from "copy-to-clipboard";

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';
import Table from 'react-bootstrap/Table';


function App() {
  const [sourcesAndLevels, setSourcesAndLevels] = useState([]);

  return (
    <div className="App">
      <Container fluid="md">
        <Row>
          <Col>
            <ConfigStack sourcesAndLevels={sourcesAndLevels} setSourcesAndLevels={setSourcesAndLevels} />
          </Col>

          <Col>
            <OutputStack data={sourcesAndLevels} />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

function ConfigStack({ sourcesAndLevels, setSourcesAndLevels }) {
  return (
    <Stack gap={3}>
      <div className="p-2">
        <SourceTable sourcesAndLevels={sourcesAndLevels} setSourcesAndLevels={setSourcesAndLevels} />
        <SimcText />
        <GenerateButton />
      </div>
    </Stack>
  )
}

function SourceTable({ sourcesAndLevels, setSourcesAndLevels }) {
  const sourceData = [
    {
      category: {display: "Raid", value: "raid"},
      levels: [
        { display: 'Normal', ilvl: 476 },
        { display: 'Heroic', ilvl: 483 },
        { display: 'Mythic', ilvl: 489 }
      ]
    },
    {
      category: {display: "Mythic Plus", value: "mplus"},
      levels: [
        { display: 'Champion', ilvl: 476 },
        { display: 'Hero', ilvl: 483 },
        { display: 'Myth', ilvl: 489 }
      ]
    },
    {
      category: {display: "Crafted", value: "crafted"},
      levels: [
        { display: 'Base', ilvl: 463 },
        { display: 'Wyrm', ilvl: 476 },
        { display: 'Aspect', ilvl: 486 }
      ]
    }
  ]

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Source</th>
          <th colSpan={3}>Level</th>
        </tr>
      </thead>
      <tbody>
        {sourceData.map((source) => (
          <tr key={'row-' + source.category.display}>
            <td>{source.category.display}</td>
            {source.levels.map((level) => (
              <SourceCell key={source.category.value + '-' + level.ilvl} display={level.display} value={source.category.value + '-' + level.ilvl} sourcesAndLevels={sourcesAndLevels} setSourcesAndLevels={setSourcesAndLevels} />
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

function SourceCell({ display, value, sourcesAndLevels, setSourcesAndLevels }) {
  const [isSelected, setSelected] = useState(false);

  const toggleClass = () => {
    setSelected(!isSelected);

    // These look reversed but it's just because the state isn't updated when executes.
    if (!isSelected && !sourcesAndLevels.includes(value)) {
      setSourcesAndLevels([...sourcesAndLevels, value])
    } else if (isSelected && sourcesAndLevels.includes(value)) {
      setSourcesAndLevels(sourcesAndLevels.filter((v) => v !== value))
    }
  };

  return (
    <td className={isSelected ? "bg-success" : null} onClick={toggleClass}>
      {display}
    </td>
  )
}

function SimcText() {
  return (
    <div className="p-2">
      <FloatingLabel controlId="floatingTextarea" label="SimC Addon Output">
        <Form.Control
          as="textarea"
          placeholder="Paste output of /simc here."
          style={{ height: '100px' }}
        />
      </FloatingLabel>
    </div>
  )
}

function GenerateButton() {
  return (
    <div className="d-grid gap-2">
      <Button variant="primary" size="lg" >
        Generate Sim Input
      </Button>
    </div>
  )
}

function OutputStack({ data }) {
  const copyToClipboard = () => {
    let copyText = data;
    let isCopy = copy(copyText);
    if (isCopy) {
      toast.info("Copied!");
    }
  };

  return (
    <Stack gap={3}>
      <div className="p-2">
        <Card>
          <Card.Body>
            <Card.Title>Paste this into an Advanced sim on raidbots.com:</Card.Title>
            <Card.Text>
              {data.join(", ")}
            </Card.Text>
            <Button variant="primary" onClick={copyToClipboard}>Copy</Button>
          </Card.Body>
        </Card>
      </div>
    </Stack>
  )
}

export default App;
