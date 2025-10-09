import { Badge, IconButton, IconButtonProps } from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";

type InsightsButtonProps = {
  isNew?: boolean;
} & IconButtonProps;

const InsightsButton = ({ isNew = false, ...props }: InsightsButtonProps) => {
  return (
    <IconButton {...props}>
      <Badge
        badgeContent="NEW"
        invisible={!isNew}
        sx={{
          "& .MuiBadge-badge": {
            fontSize: "0.625rem",
          },
        }}
      >
        <InsightsIcon />
      </Badge>
    </IconButton>
  );
};

export default InsightsButton;
