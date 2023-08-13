import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import Typography from "components/Typography";
import { ChevronRightIcon } from "assets/icons";
import AssignmentStatusCheckbox from "components/AssignmentStatusCheckbox";
import { AssignmentStatusEnum } from "types/Lessons";

interface Props {
  team: Frontend.Content.Team;
  latestOpenAssignment?: Frontend.Content.Assignment;
  onLecturePress: () => void;
  onAssignmentPress?: () => void;
}

const LectureBox = ({ team, latestOpenAssignment, onLecturePress, onAssignmentPress }: Props) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.lecture} onPress={onLecturePress}>
        <View style={styles.institutionImage}>
          <Image style={styles.institutionImage} contentFit="cover" source={team.image} />
        </View>
        <View style={styles.lectureDetails}>
          <Typography type="SubHeaderHeavy" style={{ color: Colors.Primary[1] }}>
            {team.title}
          </Typography>
          <Typography type="CaptionLight" style={{ color: Colors.Black[2] }}>
            {team.organizationName}
          </Typography>
        </View>
        <View style={styles.lectureMissingAssignments}>
          <Typography type="SmallHeavy" style={{ color: Colors.White[1] }}>
            {team.assignments}
          </Typography>
        </View>
      </TouchableOpacity>
      {latestOpenAssignment && (
        <TouchableOpacity style={styles.assignment} onPress={onAssignmentPress}>
          <AssignmentStatusCheckbox status={latestOpenAssignment.status} />
          <Typography type="BodyLight">{latestOpenAssignment.description}</Typography>
          <ChevronRightIcon
            style={{
              marginLeft: "auto",
            }}
            color={Colors.Primary[1]}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    borderRadius: GeneralConstants.BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.Gray[1],
  },
  lecture: {
    padding: GeneralConstants.Spacing.lg,
    flexDirection: "row",
    gap: GeneralConstants.Spacing.sm,
    alignItems: "center",
  },
  institutionImage: {
    width: 45,
    height: 45,
    borderRadius: 25,
  },
  lectureDetails: {
    flex: 1,
    flexDirection: "column",
  },
  lectureMissingAssignments: {
    justifyContent: "center",
    alignItems: "center",
    width: 20,
    height: 20,
    backgroundColor: Colors.Error[1],
    borderRadius: GeneralConstants.BorderRadius.xl,
  },
  assignment: {
    borderTopWidth: 1,
    borderTopColor: Colors.Gray[1],
    paddingVertical: GeneralConstants.Spacing.sm,
    paddingHorizontal: GeneralConstants.Spacing.lg,
    flexDirection: "row",
    gap: GeneralConstants.Spacing.sm,
    alignItems: "center",
  },
  checkbox: {
    height: 18.5,
    width: 18.5,
    borderRadius: GeneralConstants.BorderRadius.xxs,
  },
});

export default LectureBox;
