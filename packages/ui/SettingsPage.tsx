import { Box, CircularProgress } from '@material-ui/core'mport React, { useRef, useState } from 'react'
import { useNotification } from '../lib/useNotification'
import Editor, { Monaco } from '@monaco-editor/react'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { useLocalStorage } from 'usehooks-ts'
import { AppConfig } from '../lib/store'
import Layout from './Layout'
import { PERSIST_FILE_PATH } from '../lib/persist'
import fs from 'fs'
import { Loader } from '@mantine/core'
import { IconX, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useRef, useState } from 'react'

export default function SettingsPage() {
  const appConfig: AppConfig = useStore((state) => state.appConfig)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>()

  function onEditorMount(
    editor: monaco.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    setIsEditorReady(true)
    editorRef.current = editor
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
      onSaveEditorContents
    )
  }

  async function onSaveEditorContents() {
    const editorContents = editorRef.current?.getValue()

    if (!editorContents?.trim().length) {
      return
    }

    let newParsedSettings
    try {
      newParsedSettings = JSON.parse(editorContents)
    } catch (e) {
      notifications.show({
        id: 'error-saving-settings',
        withCloseButton: true,
        autoClose: 2500,
        title: "Invalid settings can't be saved",
        message: `<p>The settings could not be saved because it is not valid JSON.</p>
        <p>Edit the content and try again.</p>
        <p>{e.message}</p>`,
        color: 'red',
        icon: <IconX />,
        style: { backgroundColor: 'red' },
      });
      return
    }

    try {
      fs.writeFileSync(
        PERSIST_FILE_PATH,
        JSON.stringify(newParsedSettings, null, 4),
        {
          encoding: 'utf-8'
        }
      )
    } catch (e) {
      notifications.show({
        id: 'error-saving-settings-generic',
        withCloseButton: true,
        autoClose: 2500,
        title: "Settings can't be saved",
        message: `<p>The settings could not be saved.</p>
        <p>{e.message}</p>`,
        color: 'red',
        icon: <IconX />,
        style: { backgroundColor: 'red' },
      });
      return
    }

    notifications.show({
      id: 'successfully-saving-settings',
      withCloseButton: true,
      autoClose: 2500,
      title: "Settings saved",
      message: `Settings were saved successfully.`,
      color: 'blue',
      icon: <IconCheck />,
      style: { backgroundColor: 'blue' },
    });
  }
  return (
    <Layout title="Settings">
      <Box
        paddingY={1}
        style={{
          background: 'white'
        }}
      />
      <Editor
        height="90vh"
        value={JSON.stringify(appConfig, null, 4)}
        language="javascript"
        onMount={onEditorMount}
        options={{
          minimap: {
            enabled: false
          }
        }}
      />
      {!isEditorReady && <Loader color="blue" type="bars" />}
    </Layout>
  )
}
