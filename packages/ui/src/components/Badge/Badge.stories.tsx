import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: {
    children: "Fresh",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["success", "warning", "danger", "neutral"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {
  args: {
    variant: "neutral",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    children: "In stock",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children: "Expiring soon",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    children: "Expired",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="success">In stock</Badge>
      <Badge variant="warning">Expiring soon</Badge>
      <Badge variant="danger">Expired</Badge>
      <Badge variant="neutral">Pantry</Badge>
    </div>
  ),
};
