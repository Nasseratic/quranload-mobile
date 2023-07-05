import React from "react";
import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import { StyleSheet, TouchableOpacity, View, Image } from "react-native";
import Typography from "components/Typography";
import { ChevronRightIcon } from "assets/icons";
import AssignmentStatusCheckbox from "components/AssignmentStatusCheckbox";

interface Props {
  lecture?: Frontend.Content.Lecture;
  onLecturePress: () => void;
  onAssignmentPress?: () => void;
}

const LectureBox = ({ lecture, onLecturePress, onAssignmentPress }: Props) => {
  React;
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.lecture} onPress={onLecturePress}>
        <Image
          style={styles.institutionImage}
          source={{
            uri: "https://time.my-masjid.com//Uploads/b349b4c3-2a12-46a8-97fc-520480ade280-e590f.png",
          }}
        />
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
      </TouchableOpacity>
      <TouchableOpacity style={styles.assignment} onPress={onAssignmentPress}>
        <AssignmentStatusCheckbox status="pending" />
        <Typography type="BodyLight">Read: 100-101</Typography>
        <ChevronRightIcon
          style={{
            marginLeft: "auto",
          }}
          color={Colors.Primary[1]}
        />
      </TouchableOpacity>
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
