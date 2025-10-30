import { useMemo, useState } from "react";
import type { SelectChangeEvent } from "@mui/material";
import {
  Box,
  Chip,
  Collapse,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { useStorylineFilterStore } from "store";

import type { ReleaseContributorActivity } from "./StorylineChart.type";

interface StorylineFiltersProps {
  activities: ReleaseContributorActivity[];
}

const StorylineFilters = ({ activities }: StorylineFiltersProps) => {
  const { releaseRange, selectedContributors, maxContributors, setReleaseRange, toggleContributor, resetFilters } =
    useStorylineFilterStore();
  const [isExpanded, setIsExpanded] = useState(true);

  // 고유한 릴리즈 목록 추출
  const uniqueReleases = useMemo(() => {
    const releaseMap = new Map<number, string>();
    activities.forEach((a) => {
      if (!releaseMap.has(a.releaseIndex)) {
        releaseMap.set(a.releaseIndex, a.releaseTag);
      }
    });
    return Array.from(releaseMap.entries())
      .map(([index, tag]) => ({ index, tag }))
      .sort((a, b) => a.index - b.index);
  }, [activities]);

  // 고유한 기여자 목록 추출 (활동량 순)
  const topContributors = useMemo(() => {
    const contributorChanges = new Map<string, number>();
    activities.forEach((activity) => {
      const current = contributorChanges.get(activity.contributorName) || 0;
      contributorChanges.set(activity.contributorName, current + activity.changes);
    });
    return Array.from(contributorChanges.entries())
      .sort((a, b) => b[1] - a[1]) // 활동량 순 정렬
      .map(([name]) => name);
  }, [activities]);

  // 릴리즈 범위 변경 핸들러
  const handleReleaseRangeChange = (type: "start" | "end") => (event: SelectChangeEvent<number>) => {
    const value = event.target.value as number;
    if (type === "start") {
      setReleaseRange({
        startReleaseIndex: value,
        endReleaseIndex: releaseRange?.endReleaseIndex ?? uniqueReleases[uniqueReleases.length - 1].index,
      });
    } else {
      setReleaseRange({
        startReleaseIndex: releaseRange?.startReleaseIndex ?? uniqueReleases[0].index,
        endReleaseIndex: value,
      });
    }
  };

  // 기여자 클릭 핸들러
  const handleContributorClick = (contributorName: string) => {
    toggleContributor(contributorName);
  };

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    resetFilters();
  };

  const isFiltered = releaseRange !== null || selectedContributors.length > 0;

  return (
    <Box
      sx={{
        padding: 2,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 1,
        marginBottom: 2,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ marginBottom: isExpanded ? 2 : 0 }}
      >
        <FilterListIcon sx={{ color: "#b4bac6" }} />
        <Typography
          variant="h6"
          sx={{ color: "#f7f7f7", fontSize: "14px", fontWeight: 500, flex: 1 }}
        >
          Filters
        </Typography>
        {isFiltered && (
          <Chip
            label="Reset"
            size="small"
            deleteIcon={<ClearIcon />}
            onDelete={handleResetFilters}
            onClick={handleResetFilters}
            sx={{
              backgroundColor: "rgba(224, 96, 145, 0.2)",
              color: "#e06091",
              fontSize: "12px",
              "& .MuiChip-deleteIcon": {
                color: "#e06091",
              },
            }}
          />
        )}
        <IconButton
          size="small"
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{
            color: "#b4bac6",
            "&:hover": {
              color: "#e06091",
              backgroundColor: "rgba(224, 96, 145, 0.1)",
            },
          }}
        >
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Stack>

      <Collapse in={isExpanded}>
        {/* 릴리즈 범위 필터 */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ marginBottom: 2 }}
        >
          <FormControl
            size="small"
            sx={{ minWidth: 150 }}
          >
            <InputLabel sx={{ color: "#b4bac6" }}>Start Release</InputLabel>
            <Select
              value={releaseRange?.startReleaseIndex ?? ""}
              onChange={handleReleaseRangeChange("start")}
              label="Start Release"
              sx={{
                color: "#f7f7f7",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#b4bac6",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e06091",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e06091",
                },
              }}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {uniqueReleases.map((release) => (
                <MenuItem
                  key={release.index}
                  value={release.index}
                >
                  {release.tag || `Release ${release.index}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{ minWidth: 150 }}
          >
            <InputLabel sx={{ color: "#b4bac6" }}>End Release</InputLabel>
            <Select
              value={releaseRange?.endReleaseIndex ?? ""}
              onChange={handleReleaseRangeChange("end")}
              label="End Release"
              sx={{
                color: "#f7f7f7",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#b4bac6",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e06091",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e06091",
                },
              }}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {uniqueReleases.map((release) => (
                <MenuItem
                  key={release.index}
                  value={release.index}
                >
                  {release.tag || `Release ${release.index}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* 기여자 필터 */}
        <Box>
          <Typography
            variant="body2"
            sx={{
              color: "#b4bac6",
              fontSize: "12px",
              marginBottom: 1,
            }}
          >
            Contributors (select up to {maxContributors})
          </Typography>
          <Stack
            direction="row"
            flexWrap="wrap"
            gap={1}
          >
            {topContributors.map((contributor) => {
              const isSelected = selectedContributors.includes(contributor);
              return (
                <Chip
                  key={contributor}
                  label={contributor}
                  size="small"
                  onClick={() => handleContributorClick(contributor)}
                  sx={{
                    backgroundColor: isSelected ? "rgba(224, 96, 145, 0.3)" : "rgba(180, 186, 198, 0.2)",
                    color: isSelected ? "#e06091" : "#b4bac6",
                    fontSize: "11px",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: isSelected ? "rgba(224, 96, 145, 0.4)" : "rgba(180, 186, 198, 0.3)",
                    },
                  }}
                />
              );
            })}
          </Stack>
          {selectedContributors.length >= maxContributors && (
            <Typography
              variant="caption"
              sx={{
                color: "#e06091",
                fontSize: "11px",
                marginTop: 1,
                display: "block",
              }}
            >
              Maximum {maxContributors} contributors selected
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default StorylineFilters;
