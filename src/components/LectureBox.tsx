import React, { FunctionComponent } from "react";
import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import { StyleSheet, View } from "react-native";
import Typography from "components/Typography";

interface Props {
  lecture?: Frontend.Content.Lecture;
}

const LectureBox: FunctionComponent<Props> = ({ lecture }) => {
  React;
  return (
    <View style={{ ...styles.container }}>
      <View style={styles.lecture}>
        <View style={styles.institutionImage}></View>
        <View style={styles.lectureDetails}>
          <Typography type="SubHeaderHeavy" style={{ color: Colors.Primary[1] }}>
            Niveau 2 - Læsning
          </Typography>
          <Typography type="CaptionLight" style={{ color: Colors.Black[2] }}>
            Imam Malik Institutet
          </Typography>
        </View>
        <View style={styles.lectureMissingAssignments}>
          <Typography type="SmallHeavy" style={{ color: Colors.White[1] }}>
            3
          </Typography>
        </View>
      </View>
      <View style={styles.assignment}>
        <Typography type="BodyLight">Read: 100-101</Typography>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    borderRadius: GeneralConstants.BorderRadius.default,
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
    backgroundColor: Colors.Primary[1],
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
    borderRadius: GeneralConstants.BorderRadius.default,
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
});

export default LectureBox;
