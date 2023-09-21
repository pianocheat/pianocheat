import { Group, Burger, Container, Badge } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./Header.module.css";
import { IconPlugConnected } from "@tabler/icons-react";

export function Header() {
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <header className={classes.header}>
      <Container size="md">
        <div className={classes.inner}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* <Logo style={{ width: "22px" }} /> */}
            <h3
              style={{
                fontFamily: "Rubik",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "inline-block",
                fontSize: "16px",
                background: `-webkit-linear-gradient(45deg, #09009f, #4c86bf 80%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Pianocheat
            </h3>
          </div>
          <Group gap={5} visibleFrom="sm">
            <Badge
              variant="outline"
              color="lime.7"
              size="md"
              radius="lg"
              leftSection={<IconPlugConnected size="0.9rem" stroke={1.5} />}
            >
              Kawai VPC
            </Badge>
          </Group>
          <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" />
        </div>
      </Container>
    </header>
  );
}
