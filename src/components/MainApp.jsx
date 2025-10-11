import { useAppState } from '../context/AppStateContext'
import GuideControls from './GuideControls'
import ListMode from './modes/ListMode'
import ScanMode from './modes/ScanMode'
import ActionMode from './modes/ActionMode'
import MaintenanceMode from './modes/MaintenanceMode'
import ReflectionMode from './modes/ReflectionMode'

const guideFlow = [
  { key: 'intro', mode: 'intro', label: 'Introduction' },
  { key: 'listInstructions', mode: 'listInstructions', label: 'List Building Instructions' },
  { key: 'listAction', mode: 'list', label: 'List Building' },
  { key: 'scanInstructions', mode: 'scanInstructions', label: 'Scanning Instructions' },
  { key: 'scanAction', mode: 'scan', label: 'Scanning' },
  { key: 'actionInstructions', mode: 'actionInstructions', label: 'Action Instructions' },
  { key: 'actionAction', mode: 'action', label: 'Action' },
  { key: 'maintainInstructions', mode: 'maintainInstructions', label: 'Maintenance Instructions' },
  { key: 'maintainAction', mode: 'maintain', label: 'Maintenance' },
  { key: 'reflectInstructions', mode: 'reflectInstructions', label: 'Reflection Instructions' },
  { key: 'reflectAction', mode: 'reflect', label: 'Reflection' },
]

export default function MainApp() {
  const { state } = useAppState()

  if (!state.guide.started) {
    return null
  }

  const currentStep = guideFlow[state.guide.activeIndex]
  const currentMode = currentStep?.mode

  return (
    <>
      <section className="modes" id="modeSection">
        <GuideControls />
      </section>

      <section className="content">
        {currentMode === 'listInstructions' && <ListMode.Instructions />}
        {currentMode === 'list' && <ListMode.Action />}
        {currentMode === 'scanInstructions' && <ScanMode.Instructions />}
        {currentMode === 'scan' && <ScanMode.Action />}
        {currentMode === 'actionInstructions' && <ActionMode.Instructions />}
        {currentMode === 'action' && <ActionMode.Action />}
        {currentMode === 'maintainInstructions' && <MaintenanceMode.Instructions />}
        {currentMode === 'maintain' && <MaintenanceMode.Action />}
        {currentMode === 'reflectInstructions' && <ReflectionMode.Instructions />}
        {currentMode === 'reflect' && <ReflectionMode.Action />}
      </section>
    </>
  )
}
