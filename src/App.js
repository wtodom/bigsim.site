import { useState } from 'react';

import copy from "copy-to-clipboard";

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';
import Table from 'react-bootstrap/Table';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import ToggleButton from 'react-bootstrap/ToggleButton';

import dhCraftedItems from './data/loot-crafted-dh';
import dhEmbellishedItems from './data/loot-embellished-dh';
import dhMplusItems from './data/loot-mplus-dh';
import dhRaidItems from './data/loot-raid-dh';


const STAT_MAP = {
  "crit": "32",
  "haste": "36",
  "vers": "40",
  "mastery": "49"
}

function App() {
  const [sourcesAndLevels, setSourcesAndLevels] = useState({
    "raid": [],
    "mplus": [],
    "crafted": [],
    "embellished": []
  });
  const [statsVisible, setStatsVisible] = useState(false)
  const [selectedStats, setSelectedStats] = useState([])
  const [addonInput, setAddonInput] = useState('')
  const [canGenerate, setCanGenerate] = useState(false);
  const [generatedText, setgeneratedText] = useState('')
  const [showToast, setShowToast] = useState(false);

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
              canGenerate={canGenerate}
              setCanGenerate={setCanGenerate}
              setgeneratedText={setgeneratedText} />
          </Col>

          <Col>
            <NotificationSection show={showToast} setShow={setShowToast} />
            <OutputStack generatedText={generatedText} setShowToast={setShowToast} />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

function ConfigStack({ sourcesAndLevels, setSourcesAndLevels, statsVisible, setStatsVisible, selectedStats, setSelectedStats, addonInput, setAddonInput, canGenerate, setCanGenerate, setgeneratedText }) {
  return (
    <div className="p-4">
      <Stack gap={3}>
        <SourceTable sourcesAndLevels={sourcesAndLevels} setSourcesAndLevels={setSourcesAndLevels} setStatsVisible={setStatsVisible} />
        <CraftedStatsPicker isVisible={statsVisible} selectedStats={selectedStats} setSelectedStats={setSelectedStats} />
        <SimcText setAddonInput={setAddonInput} setCanGenerate={setCanGenerate} />
        <GenerateButton addonInput={addonInput} sourcesAndLevels={sourcesAndLevels} selectedStats={selectedStats} canGenerate={canGenerate} setgeneratedText={setgeneratedText} />
      </Stack>
    </div>
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
      category: { display: "Embellished (built-in)", value: "embellished" },
      levels: [
        { display: 'Base', ilvl: 463 },
        { display: 'Wyrm', ilvl: 476 },
        { display: 'Aspect', ilvl: 486 }
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

function SimcText({ setAddonInput, setCanGenerate }) {
  const handleChange = (e) => {
    setAddonInput(e.target.value);
    setCanGenerate(e.target.value !== '');
  }

  return (
    <div className="p-2">
      <FloatingLabel controlId="simc-addon-output-floatingTextarea" label="SimC Addon Output">
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

function GenerateButton({ addonInput, sourcesAndLevels, selectedStats, canGenerate, setgeneratedText }) {
  const generateText = () => {
    if (!canGenerate) {
      // TODO: show toast or validation notification with reason
      return
    }

    let generated = '' + addonInput + "\n\n";

    const statCombos = convertStats(selectedStats);
    for (const statCombo of statCombos) {
      generated += generateItems(sourcesAndLevels.crafted, dhCraftedItems, statCombo)
    }
    generated += generateItems(sourcesAndLevels.raid, dhRaidItems)
    generated += generateItems(sourcesAndLevels.mplus, dhMplusItems)
    generated += generateItems(sourcesAndLevels.embellished, dhEmbellishedItems)

    setgeneratedText(generated)
  }

  return (
    <div className="d-grid gap-2">
      <Button variant={canGenerate ? "primary" : "secondary"} size="lg" onClick={generateText} disabled={!canGenerate} >
        <GenerateIcon /> Generate Combined Sim Input
      </Button>
    </div>
  )
}

const generateItems = (ilvls, templates, statCombo) => {
  let generated = "";
  for (const ilvl of ilvls) {
    for (const template of templates) {
      const isEngItem = template.note.includes(" - Engineering");
      if (templates === dhCraftedItems && statCombo && isSingleStat(statCombo) && !isEngItem) {
        continue;
      }

      generated += template.note + "\n"
      generated += template.profileSets.map((set) => {
        if (statCombo) {
          const statStr = isEngItem ? toEngStats(statCombo) : statCombo;
          set = set.replace(/STATS_HERE/g, statStr) + ",crafted_stats=" + statStr
        }
        return set.replace(/ILVL_HERE/g, ilvl) + ",ilevel=" + ilvl + "\n"
      })
      generated += "\n"
    };
  };

  return generated;
}

const isSingleStat = (statCombo) => {
  return statCombo.split("/")[0] === statCombo.split("/")[1];
}

const toEngStats = (statCombo) => {
  const stat = statCombo.split("/")[0];
  return stat + "/" + stat;
}

const convertStats = (stats) => {
  let statCombos = [];
  if (stats.length === 1) {
    const stat = STAT_MAP[stats[0]];
    statCombos = [stat + "/" + stat];
  } else {
    statCombos = stats.flatMap((stat, i) => {
      return stats.slice(i + 1).map((otherStat) => {
        return [STAT_MAP[stat], STAT_MAP[otherStat]].join("/");
      });
    });
  }

  return statCombos;
}

function NotificationSection({ show, setShow }) {
  return (
    <ToastContainer className="p-2" position="top-end" style={{ zIndex: 1 }} >
      <Toast onClose={() => setShow(false)} show={show} delay={2000} >
        <Toast.Header className='text-success'>
          <strong className="me-auto">Sim Input Copied</strong>
        </Toast.Header>
        <Toast.Body>
          You can use the copied simc string in the Advanced section
          of Raidbots or in a local SimulationCraft install.
        </Toast.Body>
      </Toast>
    </ToastContainer>
  )
}

function OutputStack({ generatedText, setShowToast }) {
  const copyToClipboard = () => {
    let copyText = generatedText;
    let isCopy = copy(copyText);
    if (isCopy) {
      setShowToast(true);
    }
  };

  return (
    <div className="p-4">
      <Stack gap={3}>
        <FloatingLabel controlId="floatingTextarea" label="Generated Sim Input">
          <Form.Control
            as="textarea"
            className='display-newlines'
            style={{ height: '400px' }}
            value={generatedText}
            readOnly
          />
        </FloatingLabel>
        <div className="d-grid gap-2">
          <Button variant="primary" size="lg" onClick={copyToClipboard}>
            <CopyIcon /> Copy to clipboard
          </Button>
        </div>
      </Stack>
    </div>
  )
}

const GenerateIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-stars" viewBox="0 0 16 16">
      <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z" />
    </svg>
  )
}

const CopyIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-copy" viewBox="0 0 16 16">
      <path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z" />
    </svg>
  )
}

export default App;
