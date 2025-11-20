import { Button, Group, YStack } from "tamagui";

export interface DevelopmentUser {
  username: string;
  password: string;
}
const users: DevelopmentUser[] = [
  {
    username: 'underviser1@mailinator.com',
    password: '1234'
  },
  {
    username: 'test1@mailinator.com',
    password: '1234'
  },
  {
    username: 'test2@mailinator.com',
    password: '1234'
  },
]

interface DevelopmentUserSelectionProps {
  setUserCredentials: (user: DevelopmentUser) => void;
}

const DevelopmentUserSelection = ({ setUserCredentials }: DevelopmentUserSelectionProps) => {
  if (__DEV__) return null;

  return (
    <YStack paddingBottom="$3">
      <Group orientation="horizontal">
        <Group.Item>
          <Button flex={1} onPress={() => setUserCredentials(users[0]!)}>Teacher</Button>
        </Group.Item>
        <Group.Item>
          <Button flex={1} onPress={() => setUserCredentials(users[1]!)}>Student 1</Button>
        </Group.Item>
        <Group.Item>
          <Button flex={1} onPress={() => setUserCredentials(users[2]!)}>Student 2</Button>
        </Group.Item>
      </Group>
    </YStack>
  )
}

export default DevelopmentUserSelection