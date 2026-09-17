import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./Card";

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  args: {
    children: "Pantry item card content",
    padding: "md",
    interactive: false,
  },
  argTypes: {
    padding: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
    },
    interactive: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: {
    padding: "sm",
    children: "Compact padding",
  },
};

export const Spacious: Story = {
  args: {
    padding: "lg",
    children: "Spacious padding",
  },
};

export const Interactive: Story = {
  args: {
    interactive: true,
    children: "Hover or focus this card",
  },
};

export const AllPaddings: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Card padding="none">
        <div className="p-2 text-sm">none</div>
      </Card>
      <Card padding="sm">sm</Card>
      <Card padding="md">md</Card>
      <Card padding="lg">lg</Card>
    </div>
  ),
};
