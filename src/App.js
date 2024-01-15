import { useState } from 'react';

import { toast } from "react-toastify";
import copy from "copy-to-clipboard";

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';
import Table from 'react-bootstrap/Table';
import ToggleButton from 'react-bootstrap/ToggleButton';

import dhRaidItems from './data/loot-raid-dh';
import dhMplusItems from './data/loot-mplus-dh';
// import dhMplusCraftedItems from './data/loot-crafted-dh.json';
// import dhEmbellishedItems from './data/loot-embellished-dh.json';


function App() {
  const [sourcesAndLevels, setSourcesAndLevels] = useState({
    "raid": [],
    "mplus": [],
    "crafted": []
  });
  const [statsVisible, setStatsVisible] = useState(false)
  const [selectedStats, setSelectedStats] = useState([])
  const [addonInput, setAddonInput] = useState('')
  const [generatedText, setgeneratedText] = useState('')

  return (
    <div className="App">
      <Container fluid="md">
        <Row>
          <Col>
            <ConfigStack
              sourcesAndLevels={sourcesAndLevels}
              setSourcesAndLevels={setSourcesAndLevels}
              statsVisible={statsVisible}
              setStatsVisible={setStatsVisible}
              selectedStats={selectedStats}
              setSelectedStats={setSelectedStats}
              addonInput={addonInput}
              setAddonInput={setAddonInput}
              setgeneratedText={setgeneratedText} />
          </Col>

          <Col>
            <OutputStack generatedText={generatedText} />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

function ConfigStack({ sourcesAndLevels, setSourcesAndLevels, statsVisible, setStatsVisible, selectedStats, setSelectedStats, addonInput, setAddonInput, setgeneratedText }) {
  return (
    <Stack gap={3}>
      <div className="p-4">
        <SourceTable sourcesAndLevels={sourcesAndLevels} setSourcesAndLevels={setSourcesAndLevels} setStatsVisible={setStatsVisible} />
        <CraftedStatsPicker isVisible={statsVisible} selectedStats={selectedStats} setSelectedStats={setSelectedStats} />
        <SimcText setAddonInput={setAddonInput} />
        <GenerateButton addonInput={addonInput} sourcesAndLevels={sourcesAndLevels} selectedStats={selectedStats} setgeneratedText={setgeneratedText} />
      </div>
    </Stack>
  )
}

function SourceTable({ sourcesAndLevels, setSourcesAndLevels, setStatsVisible }) {
  const sourceData = [
    {
      category: { display: "Raid", value: "raid" },
      levels: [
        { display: 'Normal', ilvl: 476 },
        { display: 'Heroic', ilvl: 483 },
        { display: 'Mythic', ilvl: 489 }
      ]
    },
    {
      category: { display: "Mythic Plus", value: "mplus" },
      levels: [
        { display: 'Champion', ilvl: 476 },
        { display: 'Hero', ilvl: 483 },
        { display: 'Myth', ilvl: 489 }
      ]
    },
    {
      category: { display: "Crafted", value: "crafted" },
      levels: [
        { display: 'Base', ilvl: 463 },
        { display: 'Wyrm', ilvl: 476 },
        { display: 'Aspect', ilvl: 486 }
      ]
    }
  ]

  return (
    <Table bordered hover>
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
              <SourceCell
                key={source.category.value + '-' + level.ilvl}
                display={level.display}
                source={source.category.value}
                ilvl={level.ilvl}
                sourcesAndLevels={sourcesAndLevels}
                setSourcesAndLevels={setSourcesAndLevels}
                setStatsVisible={setStatsVisible}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

function SourceCell({ display, source, ilvl, sourcesAndLevels, setSourcesAndLevels, setStatsVisible }) {
  const [isSelected, setSelected] = useState(false);

  const handleClick = () => {
    setSelected(!isSelected);

    // These look reversed but it's just because the state isn't updated when executes.
    let newSourcesAndLevels = { ...sourcesAndLevels }
    if (!isSelected && !sourcesAndLevels[source].includes(ilvl)) {
      newSourcesAndLevels[source].push(ilvl)
    } else if (isSelected && sourcesAndLevels[source].includes(ilvl)) {
      newSourcesAndLevels[source] = newSourcesAndLevels[source].filter((v) => v !== ilvl)
    }
    setSourcesAndLevels(newSourcesAndLevels)

    if (newSourcesAndLevels['crafted'].length !== 0) {
      setStatsVisible(true)
    } else {
      setStatsVisible(false)
    }
  };

  return (
    <td className={isSelected ? "bg-success" : null} onClick={handleClick}>
      {display}
    </td>
  )
}

function CraftedStatsPicker({ isVisible, selectedStats, setSelectedStats }) {
  const [isHasteChecked, setHasteChecked] = useState(false)
  const [isCritChecked, setCritChecked] = useState(false)
  const [isVersChecked, setVersChecked] = useState(false)
  const [isMasteryChecked, setMasteryChecked] = useState(false)

  const updateSelectedStats = (stat, selected) => {
    let newStats;
    if (selected) {
      newStats = [...selectedStats, stat]
    } else {
      newStats = selectedStats.filter((s) => s !== stat)
    }
    setSelectedStats(newStats)
  }

  const handleHasteChanged = (e) => {
    let checked = e.currentTarget.checked;
    setHasteChecked(checked)
    updateSelectedStats(e.currentTarget.value, checked)
  }

  const handleCritChanged = (e) => {
    let checked = e.currentTarget.checked;
    setCritChecked(checked)
    updateSelectedStats(e.currentTarget.value, checked)
  }

  const handleVersChanged = (e) => {
    let checked = e.currentTarget.checked;
    setVersChecked(checked)
    updateSelectedStats(e.currentTarget.value, checked)
  }

  const handleMasteryChanged = (e) => {
    let checked = e.currentTarget.checked;
    setMasteryChecked(checked)
    updateSelectedStats(e.currentTarget.value, checked)
  }


  return (
    <ButtonGroup hidden={!isVisible}>
      <ToggleButton
        className="mb-2"
        id="haste-button"
        type="checkbox"
        variant="outline-primary"
        checked={isHasteChecked}
        value="haste"
        onChange={handleHasteChanged}
      >
        Haste
      </ToggleButton>

      <ToggleButton
        className="mb-2"
        id="crit-button"
        type="checkbox"
        variant="outline-primary"
        checked={isCritChecked}
        value="crit"
        onChange={handleCritChanged}
      >
        Crit
      </ToggleButton>

      <ToggleButton
        className="mb-2"
        id="vers-button"
        type="checkbox"
        variant="outline-primary"
        checked={isVersChecked}
        value="vers"
        onChange={handleVersChanged}
      >
        Versatility
      </ToggleButton>

      <ToggleButton
        className="mb-2"
        id="mastery-button"
        type="checkbox"
        variant="outline-primary"
        checked={isMasteryChecked}
        value="mastery"
        onChange={handleMasteryChanged}
      >
        Mastery
      </ToggleButton>
    </ButtonGroup>
  )
}

function SimcText({ setAddonInput }) {
  const handleChange = (e) => {
    setAddonInput(e.target.value)
  }

  return (
    <div className="p-2">
      <FloatingLabel controlId="floatingTextarea" label="SimC Addon Output">
        <Form.Control
          as="textarea"
          placeholder="Paste output of /simc here."
          style={{ height: '100px' }}
          onChange={handleChange}
        />
      </FloatingLabel>
    </div>
  )
}

function GenerateButton({ addonInput, sourcesAndLevels, selectedStats, setgeneratedText }) {
  const generateText = () => {
    let generated = '' + addonInput + "\n\n";

    if (sourcesAndLevels.raid) {
      sourcesAndLevels.raid.forEach(ilvl => {
        dhRaidItems.map((item) => {
          generated += item.note + "\n"
          item.profileSets.map((set) => {
            generated += set.replace(/ILVL_HERE/g, ilvl) + ",ilevel=" + ilvl + "\n"
          })
          generated += "\n"
        });
      });
    }

    if (sourcesAndLevels.mplus) {
      sourcesAndLevels.mplus.forEach(ilvl => {
        dhMplusItems.map((item) => {
          generated += item.note + "\n"
          item.profileSets.map((set) => {
            generated += set.replace(/ILVL_HERE/g, ilvl) + ",ilevel=" + ilvl + "\n"
          })
          generated += "\n"
        });
      });
    }

    setgeneratedText(generated)
  }

  return (
    <div className="d-grid gap-2">
      <Button variant="primary" size="lg" onClick={generateText}>
        Generate Sim Input
      </Button>
    </div>
  )
}

function OutputStack({ generatedText }) {
  const copyToClipboard = () => {
    let copyText = generatedText;
    let isCopy = copy(copyText);
    if (isCopy) {
      toast.info("Copied!");
    }
  };

  return (
    <Stack gap={3}>
      <div className="p-4">
        <Card>
          <Card.Body>
            <Card.Title>Generated Sim Input</Card.Title>
            <Card.Text className='display-newlines'>
              {generatedText}
            </Card.Text>
            <Button variant="primary" onClick={copyToClipboard}>Copy</Button>
          </Card.Body>
        </Card>
      </div>
    </Stack>
  )
}

export default App;
