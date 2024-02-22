import styled from "styled-components"
import { useToggle } from "../../hooks/toggle"
import { user } from "../../utils/firebase"
import { NameForm } from "./name-form.jsx"
import { NameBox } from "./name-box.jsx"
import { isNewPlayer } from "../../utils/misc"

const NameContainer = styled.div`
  grid-column: 2;
  text-align: left;
`

export function Name({ children }) {
  const editable = children === user.username

  const [input, toggleInput] = useToggle(isNewPlayer())

  return (
    <NameContainer>
      {input && editable ? (
        <NameForm
          initialValue={children}
          toggleInput={toggleInput}
          isNewPlayer={isNewPlayer()}
        />
      ) : (
        <NameBox
          editable={editable}
          isNewPlayer={isNewPlayer()}
          onClick={toggleInput}
        >
          {children}
        </NameBox>
      )}
    </NameContainer>
  )
}
