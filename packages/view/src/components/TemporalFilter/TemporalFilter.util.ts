// import type { GlobalProps } from "types/global";
import dayjs from "dayjs";

import type { ClusterNode } from "types/NodeTypes.temp";

import type { CommitNode } from "./TemporalFilter.type";

export function filterData(data: ClusterNode[]): any {
  const dateMap = new Map();

  data.forEach((cluster) => {
    const commitLength = cluster.commitNodeList.length;

    cluster.commitNodeList
      .filter((commitNode) => commitNode.nodeTypeName === "COMMIT")
      .forEach((commitNode) => {
        // 날짜 계산
        const { commitDate } = commitNode.commit;
        const formattedCommitDate = dayjs(commitDate).format("YYYY MM DD");

        // cloc 계산
        const { insertions, deletions } = commitNode.commit.diffStatistics;
        const cloc = insertions + deletions;

        // mapItem 만들기
        const mapItem = dateMap.get(formattedCommitDate) || {};

        mapItem.cloc = mapItem.cloc + cloc || cloc;
        mapItem.commit = mapItem.commit + commitLength || commitLength;

        dateMap.set(formattedCommitDate, mapItem);
      });
  });

  return Array.from(dateMap.entries()).sort((a, b) => dayjs(a[0]).diff(b[0]));
}

export function sortBasedOnCommitNode(data: ClusterNode[]): CommitNode[] {
  console.log(data);

  /**
   * TODO 1. 순회하면서 -> "nodeTypeName": "COMMIT" 가져오기
   */
  const dummySortedData: CommitNode[] = [
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "4f0044a51e4400ae99b76328405d0a62c7a09902",
        author: {
          names: ["Brian Munkholm "],
          emails: ["bmunkholm@users.noreply.github.com"],
        },
        committer: {
          names: ["GitHub "],
          emails: ["noreply@github.com"],
        },
        authorDate: "2018-10-23T07:03:46.000Z",
        commitDate: "2018-10-23T07:03:46.000Z",
        diffStatistics: {
          insertions: 12,
          deletions: 39,
          files: {
            "CHANGELOG.md": {
              deletions: 12,
              insertions: 39,
            },
          },
        },
      },
      seq: 15518,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "068ac09cbeb4537a7ad6022c6deccdcc67d4b5b1",
        author: {
          names: ["Brian Munkholm "],
          emails: ["bmunkholm@users.noreply.github.com"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-23T09:48:00.000Z",
        commitDate: "2018-10-23T09:48:00.000Z",
        diffStatistics: {
          insertions: 12,
          deletions: 39,
          files: {
            "CHANGELOG.md": {
              deletions: 12,
              insertions: 39,
            },
          },
        },
      },
      seq: 15519,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "2a7a93cde9c9f74d5f05c1d0fb1da8e96da7057b",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-09-13T07:30:42.000Z",
        commitDate: "2018-09-13T07:30:42.000Z",
        diffStatistics: {
          insertions: 0,
          deletions: 196,
          files: {
            "realm/realm-library/src/main/java/io/realm/Realm.java": {
              deletions: 0,
              insertions: 36,
            },
            "realm/realm-library/src/main/java/io/realm/RealmQuery.java": {
              deletions: 0,
              insertions: 38,
            },
            "realm/realm-library/src/main/java/io/realm/RealmResults.java": {
              deletions: 0,
              insertions: 14,
            },
            "realm/realm-library/src/main/java/io/realm/sync/Subscription.java":
              {
                deletions: 0,
                insertions: 108,
              },
          },
        },
      },
      seq: 15369,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "730a7504d03b0a8fe8ad73e1b4b80ef4b2ab24b1",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-12T18:22:57.000Z",
        commitDate: "2018-10-12T18:22:57.000Z",
        diffStatistics: {
          insertions: 40,
          deletions: 55,
          files: {
            "realm/realm-library/src/main/java/io/realm/Realm.java": {
              deletions: 10,
              insertions: 12,
            },
            "realm/realm-library/src/main/java/io/realm/RealmResults.java": {
              deletions: 10,
              insertions: 0,
            },
            "realm/realm-library/src/main/java/io/realm/sync/Subscription.java":
              {
                deletions: 20,
                insertions: 43,
              },
          },
        },
      },
      seq: 15480,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "0e1a41c5e675525868e96ae22fb1e3dde2ecd4dc",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-12T18:51:59.000Z",
        commitDate: "2018-10-12T18:51:59.000Z",
        diffStatistics: {
          insertions: 5,
          deletions: 28,
          files: {
            "realm/realm-library/src/main/java/io/realm/RealmQuery.java": {
              deletions: 5,
              insertions: 14,
            },
            "realm/realm-library/src/main/java/io/realm/sync/Subscription.java":
              {
                deletions: 0,
                insertions: 14,
              },
          },
        },
      },
      seq: 15481,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "02b1b675657a0c32e209a9c1402fe815d72a6167",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-12T18:52:19.000Z",
        commitDate: "2018-10-12T18:52:19.000Z",
        diffStatistics: {
          insertions: 823,
          deletions: 2752,
          files: {
            ".github/ISSUE_TEMPLATE.md": {
              deletions: 46,
              insertions: 0,
            },
            ".github/ISSUE_TEMPLATE/bug_report.md": {
              deletions: 0,
              insertions: 30,
            },
            ".github/ISSUE_TEMPLATE/feature_request.md": {
              deletions: 0,
              insertions: 16,
            },
            ".github/ISSUE_TEMPLATE/question.md": {
              deletions: 0,
              insertions: 18,
            },
            ".gitignore": {
              deletions: 0,
              insertions: 1,
            },
            "CHANGELOG.md": {
              deletions: 4,
              insertions: 75,
            },
            "README.md": {
              deletions: 1,
              insertions: 1,
            },
            "build.gradle": {
              deletions: 1,
              insertions: 1,
            },
            "dependencies.list": {
              deletions: 3,
              insertions: 11,
            },
            "examples/architectureComponentsExample/build.gradle": {
              deletions: 6,
              insertions: 6,
            },
            "examples/build.gradle": {
              deletions: 3,
              insertions: 6,
            },
            "examples/gradle.properties": {
              deletions: 4,
              insertions: 4,
            },
            "examples/gradle/wrapper/gradle-wrapper.jar": {
              deletions: 0,
              insertions: 0,
            },
            "examples/gradle/wrapper/gradle-wrapper.properties": {
              deletions: 1,
              insertions: 1,
            },
            "examples/multiprocessExample/build.gradle": {
              deletions: 1,
              insertions: 1,
            },
            "examples/newsreaderExample/build.gradle": {
              deletions: 2,
              insertions: 2,
            },
            "examples/objectServerExample/build.gradle": {
              deletions: 30,
              insertions: 15,
            },
            "examples/objectServerExample/src/main/java/io/realm/examples/objectserver/CounterActivity.java":
              {
                deletions: 9,
                insertions: 15,
              },
            "examples/objectServerExample/src/main/java/io/realm/examples/objectserver/LoginActivity.java":
              {
                deletions: 3,
                insertions: 1,
              },
            "examples/rxJavaExample/build.gradle": {
              deletions: 3,
              insertions: 3,
            },
            "examples/secureTokenAndroidKeyStore/build.gradle": {
              deletions: 1,
              insertions: 1,
            },
            "examples/threadExample/build.gradle": {
              deletions: 2,
              insertions: 1,
            },
            "examples/threadExample/src/main/java/io/realm/examples/threads/ReceivingActivity.java":
              {
                deletions: 2,
                insertions: 2,
              },
            "examples/threadExample/src/main/java/io/realm/examples/threads/ThreadExampleActivity.java":
              {
                deletions: 2,
                insertions: 2,
              },
            "examples/unitTestExample/build.gradle": {
              deletions: 6,
              insertions: 12,
            },
            "gradle-plugin/build.gradle": {
              deletions: 4,
              insertions: 8,
            },
            "gradle-plugin/gradle/wrapper/gradle-wrapper.jar": {
              deletions: 0,
              insertions: 0,
            },
            "gradle-plugin/gradle/wrapper/gradle-wrapper.properties": {
              deletions: 1,
              insertions: 1,
            },
            "gradle-plugin/src/test/groovy/io/realm/gradle/PluginTest.groovy": {
              deletions: 2,
              insertions: 5,
            },
            "gradle.properties": {
              deletions: 1,
              insertions: 5,
            },
            "gradle/wrapper/gradle-wrapper.jar": {
              deletions: 0,
              insertions: 0,
            },
            "gradle/wrapper/gradle-wrapper.properties": {
              deletions: 1,
              insertions: 1,
            },
            "library-benchmarks/build.gradle": {
              deletions: 2,
              insertions: 6,
            },
            "library-benchmarks/gradle/wrapper/gradle-wrapper.jar": {
              deletions: 0,
              insertions: 0,
            },
            "library-benchmarks/gradle/wrapper/gradle-wrapper.properties": {
              deletions: 1,
              insertions: 1,
            },
            "library-build-transformer/README.md": {
              deletions: 1,
              insertions: 18,
            },
            "library-build-transformer/build.gradle": {
              deletions: 6,
              insertions: 11,
            },
            "library-build-transformer/gradle/wrapper/gradle-wrapper.jar": {
              deletions: 0,
              insertions: 0,
            },
            "library-build-transformer/gradle/wrapper/gradle-wrapper.properties":
              {
                deletions: 1,
                insertions: 1,
              },
            "library-build-transformer/src/main/kotlin/io/realm/buildtransformer/RealmBuildTransformer.kt":
              {
                deletions: 0,
                insertions: 1,
              },
            "library-build-transformer/src/main/kotlin/io/realm/buildtransformer/asm/ClassPoolTransformer.kt":
              {
                deletions: 6,
                insertions: 7,
              },
            "library-build-transformer/src/main/kotlin/io/realm/buildtransformer/asm/visitors/AnnotatedCodeStripVisitor.kt":
              {
                deletions: 15,
                insertions: 10,
              },
            "library-build-transformer/src/main/kotlin/io/realm/buildtransformer/asm/visitors/AnnotationVisitor.kt":
              {
                deletions: 3,
                insertions: 17,
              },
            "library-build-transformer/src/test/java/io/realm/buildtransformer/testclasses/SimpleTestFields.java":
              {
                deletions: 0,
                insertions: 3,
              },
            "library-build-transformer/src/test/java/io/realm/internal/annotations/CustomAnnotation.java":
              {
                deletions: 0,
                insertions: 11,
              },
            "library-build-transformer/src/test/kotlin/io/realm/buildtransformer/VisitorTests.kt":
              {
                deletions: 7,
                insertions: 13,
              },
            "realm-annotations/build.gradle": {
              deletions: 2,
              insertions: 5,
            },
            "realm-annotations/gradle/wrapper/gradle-wrapper.jar": {
              deletions: 0,
              insertions: 0,
            },
            "realm-annotations/gradle/wrapper/gradle-wrapper.properties": {
              deletions: 1,
              insertions: 1,
            },
            "realm-annotations/src/main/java/io/realm/annotations/RealmClass.java":
              {
                deletions: 0,
                insertions: 10,
              },
            "realm-annotations/src/main/java/io/realm/annotations/RealmField.java":
              {
                deletions: 0,
                insertions: 9,
              },
            "realm-transformer/build.gradle": {
              deletions: 12,
              insertions: 8,
            },
            "realm-transformer/gradle/wrapper/gradle-wrapper.jar": {
              deletions: 0,
              insertions: 0,
            },
            "realm-transformer/gradle/wrapper/gradle-wrapper.properties": {
              deletions: 1,
              insertions: 1,
            },
            "realm-transformer/src/test/groovy/io/realm/transformer/BytecodeModifierTest.groovy":
              {
                deletions: 223,
                insertions: 0,
              },
            "realm-transformer/src/test/kotlin/io/realm/transformer/ByteCodeModifierTest.kt":
              {
                deletions: 0,
                insertions: 238,
              },
            "realm.properties": {
              deletions: 1,
              insertions: 1,
            },
            "realm/build.gradle": {
              deletions: 8,
              insertions: 12,
            },
            "realm/gradle.properties": {
              deletions: 0,
              insertions: 4,
            },
            "realm/gradle/wrapper/gradle-wrapper.jar": {
              deletions: 0,
              insertions: 0,
            },
            "realm/gradle/wrapper/gradle-wrapper.properties": {
              deletions: 1,
              insertions: 1,
            },
            "realm/kotlin-extensions/build.gradle": {
              deletions: 5,
              insertions: 25,
            },
            "realm/kotlin-extensions/src/androidTest/kotlin/io/realm/KotlinRealmTests.kt":
              {
                deletions: 3,
                insertions: 1,
              },
            "realm/kotlin-extensions/src/androidTestObjectServer/kotlin/io/realm/kotlin/KotlinSyncedRealmTests.kt":
              {
                deletions: 0,
                insertions: 71,
              },
            "realm/kotlin-extensions/src/objectServer/kotlin/io/realm/kotlin/SyncedRealmExtensions.kt":
              {
                deletions: 0,
                insertions: 53,
              },
            "realm/realm-annotations-processor/build.gradle": {
              deletions: 0,
              insertions: 8,
            },
            "realm/realm-annotations-processor/src/main/java/io/realm/processor/ClassMetaData.java":
              {
                deletions: 8,
                insertions: 11,
              },
            "realm/realm-annotations-processor/src/test/resources/some/test/NamePolicyClassOnly.java":
              {
                deletions: 1,
                insertions: 1,
              },
            "realm/realm-annotations-processor/src/test/resources/some/test/NamePolicyFieldNameOnly.java":
              {
                deletions: 1,
                insertions: 1,
              },
            "realm/realm-library/build.gradle": {
              deletions: 9,
              insertions: 15,
            },
            "realm/realm-library/gradle.properties": {
              deletions: 0,
              insertions: 0,
            },
            "realm/realm-library/src/androidTest/java/io/realm/CustomRealmNameTests.java":
              {
                deletions: 0,
                insertions: 14,
              },
            "realm/realm-library/src/androidTest/java/io/realm/NotificationsTest.java":
              {
                deletions: 0,
                insertions: 110,
              },
            "realm/realm-library/src/androidTest/java/io/realm/RealmQueryTests.java":
              {
                deletions: 1,
                insertions: 95,
              },
            "realm/realm-library/src/androidTest/java/io/realm/SortTest.java": {
              deletions: 2,
              insertions: 2,
            },
            "realm/realm-library/src/androidTest/java/io/realm/entities/realmname/ClassWithValueDefinedNames.java":
              {
                deletions: 0,
                insertions: 33,
              },
            "realm/realm-library/src/androidTest/java/io/realm/entities/realmname/CustomRealmNamesModule.java":
              {
                deletions: 5,
                insertions: 8,
              },
            "realm/realm-library/src/androidTest/java/io/realm/internal/OsObjectStoreTests.java":
              {
                deletions: 0,
                insertions: 14,
              },
            "realm/realm-library/src/androidTest/java/io/realm/internal/OsResultsTests.java":
              {
                deletions: 6,
                insertions: 10,
              },
            "realm/realm-library/src/androidTest/java/io/realm/internal/android/JsonUtilsTest.java":
              {
                deletions: 9,
                insertions: 26,
              },
            "realm/realm-library/src/androidTest/java/io/realm/internal/{SortDescriptorTests.java => QueryDescriptorTests.java}":
              {
                deletions: 20,
                insertions: 21,
              },
            "realm/realm-library/src/androidTestObjectServer/java/io/realm/AuthenticateRequestTests.java":
              {
                deletions: 1,
                insertions: 0,
              },
            "realm/realm-library/src/androidTestObjectServer/java/io/realm/ObjectLevelPermissionsTest.java":
              {
                deletions: 1,
                insertions: 113,
              },
            "realm/realm-library/src/androidTestObjectServer/java/io/realm/SchemaTests.java":
              {
                deletions: 1,
                insertions: 0,
              },
            "realm/realm-library/src/androidTestObjectServer/java/io/realm/SessionTests.java":
              {
                deletions: 2,
                insertions: 9,
              },
            "realm/realm-library/src/androidTestObjectServer/java/io/realm/SyncConfigurationTests.java":
              {
                deletions: 5,
                insertions: 4,
              },
            "realm/realm-library/src/androidTestObjectServer/java/io/realm/SyncManagerTests.java":
              {
                deletions: 1,
                insertions: 174,
              },
            "realm/realm-library/src/androidTestObjectServer/java/io/realm/SyncUserTests.java":
              {
                deletions: 17,
                insertions: 11,
              },
            "realm/realm-library/src/androidTestObjectServer/java/io/realm/SyncedRealmMigrationTests.java":
              {
                deletions: 2,
                insertions: 1,
              },
            "realm/realm-library/src/androidTestObjectServer/java/io/realm/SyncedRealmTests.java":
              {
                deletions: 2,
                insertions: 0,
              },
            "realm/realm-library/src/main/cpp/CMakeLists.txt": {
              deletions: 0,
              insertions: 1,
            },
            "realm/realm-library/src/main/cpp/io_realm_SyncSession.cpp": {
              deletions: 0,
              insertions: 31,
            },
            "realm/realm-library/src/main/cpp/io_realm_internal_OsRealmConfig.cpp":
              {
                deletions: 4,
                insertions: 22,
              },
            "realm/realm-library/src/main/cpp/io_realm_internal_OsResults.cpp":
              {
                deletions: 13,
                insertions: 7,
              },
            "realm/realm-library/src/main/cpp/io_realm_internal_core_DescriptorOrdering.cpp":
              {
                deletions: 0,
                insertions: 101,
              },
            "realm/realm-library/src/main/cpp/object-store": {
              deletions: 1,
              insertions: 1,
            },
            "realm/realm-library/src/main/cpp/util.cpp": {
              deletions: 10,
              insertions: 10,
            },
            "realm/realm-library/src/main/cpp/{java_sort_descriptor.cpp => java_query_descriptor.cpp}":
              {
                deletions: 8,
                insertions: 8,
              },
            "realm/realm-library/src/main/cpp/{java_sort_descriptor.hpp => java_query_descriptor.hpp}":
              {
                deletions: 13,
                insertions: 14,
              },
            "realm/realm-library/src/main/java/io/realm/OrderedRealmCollectionImpl.java":
              {
                deletions: 7,
                insertions: 7,
              },
            "realm/realm-library/src/main/java/io/realm/Realm.java": {
              deletions: 6,
              insertions: 18,
            },
            "realm/realm-library/src/main/java/io/realm/RealmQuery.java": {
              deletions: 26,
              insertions: 37,
            },
            "realm/realm-library/src/main/java/io/realm/internal/ObjectServerFacade.java":
              {
                deletions: 6,
                insertions: 2,
              },
            "realm/realm-library/src/main/java/io/realm/internal/OsRealmConfig.java":
              {
                deletions: 5,
                insertions: 34,
              },
            "realm/realm-library/src/main/java/io/realm/internal/OsResults.java":
              {
                deletions: 16,
                insertions: 10,
              },
            "realm/realm-library/src/main/java/io/realm/internal/PendingRow.java":
              {
                deletions: 2,
                insertions: 3,
              },
            "realm/realm-library/src/main/java/io/realm/internal/SubscriptionAwareOsResults.java":
              {
                deletions: 3,
                insertions: 3,
              },
            "realm/realm-library/src/main/java/io/realm/internal/core/DescriptorOrdering.java":
              {
                deletions: 0,
                insertions: 114,
              },
            "realm/realm-library/src/main/java/io/realm/internal/core/package-info.java":
              {
                deletions: 0,
                insertions: 18,
              },
            "realm/realm-library/src/main/java/io/realm/internal/sync/OsSubscription.java":
              {
                deletions: 0,
                insertions: 1,
              },
            "realm/realm-library/src/main/java/io/realm/internal/sync/PermissionHelper.java":
              {
                deletions: 0,
                insertions: 65,
              },
            "realm/realm-library/src/main/java/io/realm/internal/{SortDescriptor.java => core/QueryDescriptor.java}":
              {
                deletions: 21,
                insertions: 26,
              },
            "realm/realm-library/src/main/java/io/realm/sync/permissions/ClassPermissions.java":
              {
                deletions: 0,
                insertions: 24,
              },
            "realm/realm-library/src/main/java/io/realm/sync/permissions/RealmPermissions.java":
              {
                deletions: 0,
                insertions: 23,
              },
            "realm/realm-library/src/objectServer/java/io/realm/SyncConfiguration.java":
              {
                deletions: 36,
                insertions: 58,
              },
            "realm/realm-library/src/objectServer/java/io/realm/SyncManager.java":
              {
                deletions: 0,
                insertions: 167,
              },
            "realm/realm-library/src/objectServer/java/io/realm/SyncSession.java":
              {
                deletions: 0,
                insertions: 33,
              },
            "realm/realm-library/src/objectServer/java/io/realm/internal/SyncObjectServerFacade.java":
              {
                deletions: 3,
                insertions: 19,
              },
            "realm/realm-library/src/objectServer/java/io/realm/internal/network/AuthenticationServer.java":
              {
                deletions: 0,
                insertions: 21,
              },
            "realm/realm-library/src/objectServer/java/io/realm/internal/network/OkHttpAuthenticationServer.java":
              {
                deletions: 1,
                insertions: 97,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/BaseIntegrationTest.java":
              {
                deletions: 54,
                insertions: 1,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/IsolatedIntegrationTests.java":
              {
                deletions: 3,
                insertions: 3,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/StandardIntegrationTest.java":
              {
                deletions: 3,
                insertions: 3,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/SyncSessionTests.java":
              {
                deletions: 24,
                insertions: 74,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/SyncedRealmIntegrationTests.java":
              {
                deletions: 2,
                insertions: 95,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/objectserver/AuthTests.java":
              {
                deletions: 1,
                insertions: 1,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/objectserver/EncryptedSynchronizedRealmTests.java":
              {
                deletions: 1,
                insertions: 1,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/objectserver/QueryBasedSyncTests.java":
              {
                deletions: 1,
                insertions: 41,
              },
            "realm/realm-library/src/{androidTest => testUtils}/kotlin/io/realm/entities/AllKotlinTypes.kt":
              {
                deletions: 0,
                insertions: 0,
              },
            "realm/realm-library/src/{androidTestObjectServer => syncTestUtils}/java/io/realm/TestSyncConfigurationFactory.java":
              {
                deletions: 0,
                insertions: 0,
              },
            "realm/realm-library/src/{androidTestObjectServer/java/io/realm/util => syncTestUtils/java/io/realm}/SyncTestUtils.java":
              {
                deletions: 1,
                insertions: 58,
              },
            "realm/realm-library/src/{syncIntegrationTest => syncTestUtils}/java/io/realm/objectserver/utils/Constants.java":
              {
                deletions: 0,
                insertions: 0,
              },
            "realm/realm-library/src/{syncIntegrationTest => syncTestUtils}/java/io/realm/objectserver/utils/UserFactory.java":
              {
                deletions: 5,
                insertions: 12,
              },
            "realm/realm-library/src/{syncIntegrationTest => syncTestUtils}/java/io/realm/objectserver/utils/UserFactoryStore.java":
              {
                deletions: 0,
                insertions: 0,
              },
            "tools/sync_test_server/integration-test-command-server.js": {
              deletions: 13,
              insertions: 21,
            },
            "tools/sync_test_server/ros/package.json": {
              deletions: 1,
              insertions: 1,
            },
            "version.txt": {
              deletions: 1,
              insertions: 1,
            },
          },
        },
      },
      seq: 15482,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "87413b86399dfb933ce415a6c5532dfdf48e52ec",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-12T21:16:01.000Z",
        commitDate: "2018-10-12T21:16:01.000Z",
        diffStatistics: {
          insertions: 33,
          deletions: 97,
          files: {
            "realm/realm-library/src/main/cpp/CMakeLists.txt": {
              deletions: 0,
              insertions: 1,
            },
            "realm/realm-library/src/main/cpp/io_realm_RealmQuery.cpp": {
              deletions: 0,
              insertions: 37,
            },
            "realm/realm-library/src/main/java/io/realm/Realm.java": {
              deletions: 2,
              insertions: 2,
            },
            "realm/realm-library/src/main/java/io/realm/RealmQuery.java": {
              deletions: 24,
              insertions: 48,
            },
            "realm/realm-library/src/main/java/io/realm/sync/Subscription.java":
              {
                deletions: 7,
                insertions: 9,
              },
          },
        },
      },
      seq: 15483,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "be99baab618b7ac36c219829591ed0471da4d859",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-12T21:21:36.000Z",
        commitDate: "2018-10-12T21:21:36.000Z",
        diffStatistics: {
          insertions: 1,
          deletions: 6,
          files: {
            "realm/realm-library/src/objectServer/java/io/realm/internal/sync/permissions/ObjectPermissionsModule.java":
              {
                deletions: 1,
                insertions: 6,
              },
          },
        },
      },
      seq: 15484,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "9d9eeaeb0ceb71ebce540f2263d37527600cdba1",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-13T08:51:55.000Z",
        commitDate: "2018-10-13T08:51:55.000Z",
        diffStatistics: {
          insertions: 10,
          deletions: 76,
          files: {
            "realm/realm-library/src/androidTestObjectServer/java/io/realm/SyncedRealmTests.java":
              {
                deletions: 0,
                insertions: 56,
              },
            "realm/realm-library/src/main/java/io/realm/Realm.java": {
              deletions: 3,
              insertions: 7,
            },
            "realm/realm-library/src/main/java/io/realm/RealmQuery.java": {
              deletions: 1,
              insertions: 1,
            },
            "realm/realm-library/src/main/java/io/realm/sync/Subscription.java":
              {
                deletions: 6,
                insertions: 12,
              },
          },
        },
      },
      seq: 15485,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "76066ab8846cfab085a0d640ce3eb189b638f4f0",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-13T09:47:30.000Z",
        commitDate: "2018-10-13T09:47:30.000Z",
        diffStatistics: {
          insertions: 16,
          deletions: 211,
          files: {
            "realm/realm-library/src/androidTestObjectServer/java/io/realm/SyncedRealmQueryTests.java":
              {
                deletions: 0,
                insertions: 179,
              },
            "realm/realm-library/src/main/java/io/realm/RealmQuery.java": {
              deletions: 5,
              insertions: 13,
            },
            "realm/realm-library/src/main/java/io/realm/sync/Subscription.java":
              {
                deletions: 11,
                insertions: 19,
              },
          },
        },
      },
      seq: 15486,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "a3c1e94cef8d0c6b13edf9792faf7ae32532d877",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-13T23:28:38.000Z",
        commitDate: "2018-10-13T23:28:38.000Z",
        diffStatistics: {
          insertions: 21,
          deletions: 46,
          files: {
            "realm/realm-library/src/androidTestObjectServer/java/io/realm/SyncedRealmQueryTests.java":
              {
                deletions: 1,
                insertions: 1,
              },
            "realm/realm-library/src/main/cpp/io_realm_RealmQuery.cpp": {
              deletions: 1,
              insertions: 23,
            },
            "realm/realm-library/src/main/cpp/object-store": {
              deletions: 1,
              insertions: 1,
            },
            "realm/realm-library/src/main/cpp/util.cpp": {
              deletions: 0,
              insertions: 13,
            },
            "realm/realm-library/src/main/java/io/realm/RealmQuery.java": {
              deletions: 18,
              insertions: 8,
            },
          },
        },
      },
      seq: 15487,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "43767a9370926bb85ee7fb49eee61f7fd16ff57b",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-13T23:36:39.000Z",
        commitDate: "2018-10-13T23:36:39.000Z",
        diffStatistics: {
          insertions: 0,
          deletions: 9,
          files: {
            "CHANGELOG.md": {
              deletions: 0,
              insertions: 9,
            },
          },
        },
      },
      seq: 15488,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "99a24f4a6ac352f60f2d949addc9b52459d6a5d1",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-14T13:34:55.000Z",
        commitDate: "2018-10-14T13:34:55.000Z",
        diffStatistics: {
          insertions: 49,
          deletions: 309,
          files: {
            "CHANGELOG.md": {
              deletions: 1,
              insertions: 1,
            },
            "realm/realm-library/src/androidTestObjectServer/java/io/realm/SyncedRealmQueryTests.java":
              {
                deletions: 0,
                insertions: 2,
              },
            "realm/realm-library/src/main/cpp/util.cpp": {
              deletions: 2,
              insertions: 2,
            },
            "realm/realm-library/src/main/java/io/realm/BaseRealm.java": {
              deletions: 1,
              insertions: 2,
            },
            "realm/realm-library/src/main/java/io/realm/RealmCache.java": {
              deletions: 31,
              insertions: 99,
            },
            "realm/realm-library/src/main/java/io/realm/internal/ObjectServerFacade.java":
              {
                deletions: 2,
                insertions: 14,
              },
            "realm/realm-library/src/main/java/io/realm/sync/Subscription.java":
              {
                deletions: 8,
                insertions: 72,
              },
            "realm/realm-library/src/objectServer/java/io/realm/exceptions/DownloadingRealmInterruptedException.java":
              {
                deletions: 0,
                insertions: 3,
              },
            "realm/realm-library/src/objectServer/java/io/realm/internal/SyncObjectServerFacade.java":
              {
                deletions: 1,
                insertions: 49,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/objectserver/QueryBasedSyncTests.java":
              {
                deletions: 3,
                insertions: 65,
              },
          },
        },
      },
      seq: 15489,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "16cf0ab13a2950e44d81e834726425ef58206a9b",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-15T07:32:09.000Z",
        commitDate: "2018-10-15T07:32:09.000Z",
        diffStatistics: {
          insertions: 1,
          deletions: 1,
          files: {
            "realm/realm-library/src/main/cpp/object-store": {
              deletions: 1,
              insertions: 1,
            },
          },
        },
      },
      seq: 15491,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "41b50bc06c558e0cd5119a0f1f6ddfa1b83dbde6",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-15T08:07:25.000Z",
        commitDate: "2018-10-15T08:07:25.000Z",
        diffStatistics: {
          insertions: 1,
          deletions: 1,
          files: {
            "realm/realm-library/src/main/cpp/object-store": {
              deletions: 1,
              insertions: 1,
            },
          },
        },
      },
      seq: 15492,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "381d989bd3c0e82633fa6ba42a3109f760f2623c",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-15T08:41:35.000Z",
        commitDate: "2018-10-15T08:41:35.000Z",
        diffStatistics: {
          insertions: 1,
          deletions: 6,
          files: {
            "realm/config/findbugs/findbugs-filter.xml": {
              deletions: 0,
              insertions: 3,
            },
            "realm/realm-library/src/main/java/io/realm/RealmCache.java": {
              deletions: 1,
              insertions: 3,
            },
          },
        },
      },
      seq: 15493,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "0c41625a9a0b21acb45e04012f61d488a2f14c6c",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-15T18:49:14.000Z",
        commitDate: "2018-10-15T18:49:14.000Z",
        diffStatistics: {
          insertions: 33,
          deletions: 24,
          files: {
            "realm/realm-library/src/main/cpp/object-store": {
              deletions: 1,
              insertions: 1,
            },
            "realm/realm-library/src/main/java/io/realm/RealmCache.java": {
              deletions: 32,
              insertions: 23,
            },
          },
        },
      },
      seq: 15494,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "fe37952309545c5ad21f6a75cad960afc8375a2e",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-17T12:47:03.000Z",
        commitDate: "2018-10-17T12:47:03.000Z",
        diffStatistics: {
          insertions: 2,
          deletions: 5,
          files: {
            "CHANGELOG.md": {
              deletions: 1,
              insertions: 4,
            },
            "realm/realm-library/src/main/cpp/object-store": {
              deletions: 1,
              insertions: 1,
            },
          },
        },
      },
      seq: 15502,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "025e3a2f6c431cef0a85eeb6d55cb91d86563241",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-17T15:23:40.000Z",
        commitDate: "2018-10-17T15:23:40.000Z",
        diffStatistics: {
          insertions: 0,
          deletions: 3,
          files: {
            "realm/realm-library/src/main/java/io/realm/sync/Subscription.java":
              {
                deletions: 0,
                insertions: 3,
              },
          },
        },
      },
      seq: 15503,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "322e1b4cb49a5779cbc1880ab46c2473a88d7ffc",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-22T12:24:28.000Z",
        commitDate: "2018-10-22T12:24:28.000Z",
        diffStatistics: {
          insertions: 16,
          deletions: 11,
          files: {
            "realm/realm-library/src/main/java/io/realm/RealmCache.java": {
              deletions: 9,
              insertions: 5,
            },
            "realm/realm-library/src/main/java/io/realm/sync/Subscription.java":
              {
                deletions: 5,
                insertions: 5,
              },
            "realm/realm-library/src/objectServer/java/io/realm/internal/SyncObjectServerFacade.java":
              {
                deletions: 2,
                insertions: 1,
              },
          },
        },
      },
      seq: 15511,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "5a1a4b5b13ee9f08cae8c0be8cf94db04eb5011b",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-23T10:11:13.000Z",
        commitDate: "2018-10-23T10:11:13.000Z",
        diffStatistics: {
          insertions: 15,
          deletions: 82,
          files: {
            "CHANGELOG.md": {
              deletions: 9,
              insertions: 50,
            },
            "realm/realm-library/src/main/java/io/realm/internal/SubscriptionAwareOsResults.java":
              {
                deletions: 2,
                insertions: 1,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/SyncedRealmIntegrationTests.java":
              {
                deletions: 0,
                insertions: 28,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/objectserver/EncryptedSynchronizedRealmTests.java":
              {
                deletions: 3,
                insertions: 1,
              },
            "version.txt": {
              deletions: 1,
              insertions: 2,
            },
          },
        },
      },
      seq: 15520,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "5f0b95ef1091dabc7cf5c406d232c6662f71aa8c",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-23T11:43:44.000Z",
        commitDate: "2018-10-23T11:43:44.000Z",
        diffStatistics: {
          insertions: 15,
          deletions: 48,
          files: {
            "realm/realm-library/src/main/java/io/realm/RealmCache.java": {
              deletions: 7,
              insertions: 7,
            },
            "realm/realm-library/src/main/java/io/realm/RealmQuery.java": {
              deletions: 1,
              insertions: 1,
            },
            "realm/realm-library/src/main/java/io/realm/RealmResults.java": {
              deletions: 4,
              insertions: 0,
            },
            "realm/realm-library/src/main/java/io/realm/sync/Subscription.java":
              {
                deletions: 1,
                insertions: 1,
              },
            "realm/realm-library/src/objectServer/java/io/realm/internal/SyncObjectServerFacade.java":
              {
                deletions: 1,
                insertions: 1,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/objectserver/QueryBasedSyncTests.java":
              {
                deletions: 1,
                insertions: 38,
              },
          },
        },
      },
      seq: 15521,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "e4fa7d28022a62c48b4ef88fb3d5ed21d7ed36e9",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-23T11:43:44.000Z",
        commitDate: "2018-10-23T14:13:31.000Z",
        diffStatistics: {
          insertions: 23,
          deletions: 75,
          files: {
            "realm/realm-library/src/main/java/io/realm/RealmCache.java": {
              deletions: 7,
              insertions: 7,
            },
            "realm/realm-library/src/main/java/io/realm/RealmQuery.java": {
              deletions: 1,
              insertions: 1,
            },
            "realm/realm-library/src/main/java/io/realm/RealmResults.java": {
              deletions: 4,
              insertions: 0,
            },
            "realm/realm-library/src/main/java/io/realm/sync/Subscription.java":
              {
                deletions: 1,
                insertions: 1,
              },
            "realm/realm-library/src/objectServer/java/io/realm/SyncManager.java":
              {
                deletions: 8,
                insertions: 27,
              },
            "realm/realm-library/src/objectServer/java/io/realm/internal/SyncObjectServerFacade.java":
              {
                deletions: 1,
                insertions: 1,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/objectserver/QueryBasedSyncTests.java":
              {
                deletions: 1,
                insertions: 38,
              },
          },
        },
      },
      seq: 15525,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "b2ad37011c101e08d5b356a40523c5deeaebaf43",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-23T14:14:35.000Z",
        commitDate: "2018-10-23T14:14:35.000Z",
        diffStatistics: {
          insertions: 0,
          deletions: 0,
          files: {},
        },
      },
      seq: 15526,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "dc1ff5bc9292bbfea816b7a77e554c2728478756",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        authorDate: "2018-10-23T15:12:17.000Z",
        commitDate: "2018-10-26T16:48:55.000Z",
        diffStatistics: {
          insertions: 197,
          deletions: 251,
          files: {
            "realm/realm-library/src/androidTest/java/io/realm/DynamicRealmTests.java":
              {
                deletions: 9,
                insertions: 17,
              },
            "realm/realm-library/src/androidTest/java/io/realm/LinkingObjectsDynamicTests.java":
              {
                deletions: 22,
                insertions: 24,
              },
            "realm/realm-library/src/androidTest/java/io/realm/LinkingObjectsManagedTests.java":
              {
                deletions: 12,
                insertions: 21,
              },
            "realm/realm-library/src/androidTest/java/io/realm/RealmAsyncQueryTests.java":
              {
                deletions: 1,
                insertions: 0,
              },
            "realm/realm-library/src/androidTest/java/io/realm/RealmTests.java":
              {
                deletions: 0,
                insertions: 2,
              },
            "realm/realm-library/src/androidTest/java/io/realm/RunTestInLooperThreadLifeCycleTest.java":
              {
                deletions: 1,
                insertions: 2,
              },
            "realm/realm-library/src/androidTest/java/io/realm/RxJavaTests.java":
              {
                deletions: 31,
                insertions: 17,
              },
            "realm/realm-library/src/androidTest/java/io/realm/internal/RealmNotifierTests.java":
              {
                deletions: 1,
                insertions: 1,
              },
            "realm/realm-library/src/androidTestObjectServer/java/io/realm/SyncManagerTests.java":
              {
                deletions: 0,
                insertions: 2,
              },
            "realm/realm-library/src/androidTestObjectServer/java/io/realm/SyncedRealmQueryTests.java":
              {
                deletions: 3,
                insertions: 2,
              },
            "realm/realm-library/src/main/cpp/object-store": {
              deletions: 1,
              insertions: 1,
            },
            "realm/realm-library/src/objectServer/java/io/realm/SyncManager.java":
              {
                deletions: 23,
                insertions: 7,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/IsolatedIntegrationTests.java":
              {
                deletions: 2,
                insertions: 6,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/StandardIntegrationTest.java":
              {
                deletions: 2,
                insertions: 6,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/SyncSessionTests.java":
              {
                deletions: 36,
                insertions: 54,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/SyncedRealmIntegrationTests.java":
              {
                deletions: 6,
                insertions: 21,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/objectserver/AuthTests.java":
              {
                deletions: 4,
                insertions: 4,
              },
            "realm/realm-library/src/syncTestUtils/java/io/realm/SyncTestUtils.java":
              {
                deletions: 15,
                insertions: 17,
              },
            "realm/realm-library/src/testUtils/java/io/realm/TestHelper.java": {
              deletions: 3,
              insertions: 0,
            },
            "realm/realm-library/src/testUtils/java/io/realm/rule/RunInLooperThread.java":
              {
                deletions: 25,
                insertions: 47,
              },
          },
        },
      },
      seq: 15532,
    },
    {
      nodeTypeName: "COMMIT",
      commit: {
        id: "1c71cac78dfe029c6a8b3822fbf338c54693383e",
        author: {
          names: ["Christian Melchior "],
          emails: ["christian@ilios.dk"],
        },
        committer: {
          names: ["GitHub "],
          emails: ["noreply@github.com"],
        },
        authorDate: "2018-10-26T17:14:49.000Z",
        commitDate: "2018-10-26T17:14:49.000Z",
        diffStatistics: {
          insertions: 194,
          deletions: 1163,
          files: {
            "CHANGELOG.md": {
              deletions: 2,
              insertions: 22,
            },
            "realm/config/findbugs/findbugs-filter.xml": {
              deletions: 0,
              insertions: 3,
            },
            "realm/realm-library/src/androidTest/java/io/realm/DynamicRealmTests.java":
              {
                deletions: 9,
                insertions: 17,
              },
            "realm/realm-library/src/androidTest/java/io/realm/LinkingObjectsDynamicTests.java":
              {
                deletions: 22,
                insertions: 24,
              },
            "realm/realm-library/src/androidTest/java/io/realm/LinkingObjectsManagedTests.java":
              {
                deletions: 12,
                insertions: 21,
              },
            "realm/realm-library/src/androidTest/java/io/realm/RealmAsyncQueryTests.java":
              {
                deletions: 1,
                insertions: 0,
              },
            "realm/realm-library/src/androidTest/java/io/realm/RealmTests.java":
              {
                deletions: 0,
                insertions: 2,
              },
            "realm/realm-library/src/androidTest/java/io/realm/RunTestInLooperThreadLifeCycleTest.java":
              {
                deletions: 1,
                insertions: 2,
              },
            "realm/realm-library/src/androidTest/java/io/realm/RxJavaTests.java":
              {
                deletions: 31,
                insertions: 17,
              },
            "realm/realm-library/src/androidTest/java/io/realm/internal/RealmNotifierTests.java":
              {
                deletions: 1,
                insertions: 1,
              },
            "realm/realm-library/src/androidTestObjectServer/java/io/realm/SyncManagerTests.java":
              {
                deletions: 0,
                insertions: 2,
              },
            "realm/realm-library/src/androidTestObjectServer/java/io/realm/SyncedRealmQueryTests.java":
              {
                deletions: 0,
                insertions: 180,
              },
            "realm/realm-library/src/androidTestObjectServer/java/io/realm/SyncedRealmTests.java":
              {
                deletions: 0,
                insertions: 56,
              },
            "realm/realm-library/src/main/cpp/CMakeLists.txt": {
              deletions: 0,
              insertions: 1,
            },
            "realm/realm-library/src/main/cpp/io_realm_RealmQuery.cpp": {
              deletions: 0,
              insertions: 59,
            },
            "realm/realm-library/src/main/cpp/object-store": {
              deletions: 1,
              insertions: 1,
            },
            "realm/realm-library/src/main/cpp/util.cpp": {
              deletions: 0,
              insertions: 13,
            },
            "realm/realm-library/src/main/java/io/realm/BaseRealm.java": {
              deletions: 1,
              insertions: 2,
            },
            "realm/realm-library/src/main/java/io/realm/Realm.java": {
              deletions: 0,
              insertions: 42,
            },
            "realm/realm-library/src/main/java/io/realm/RealmCache.java": {
              deletions: 12,
              insertions: 69,
            },
            "realm/realm-library/src/main/java/io/realm/RealmQuery.java": {
              deletions: 0,
              insertions: 69,
            },
            "realm/realm-library/src/main/java/io/realm/internal/ObjectServerFacade.java":
              {
                deletions: 2,
                insertions: 14,
              },
            "realm/realm-library/src/main/java/io/realm/sync/Subscription.java":
              {
                deletions: 0,
                insertions: 228,
              },
            "realm/realm-library/src/objectServer/java/io/realm/SyncManager.java":
              {
                deletions: 1,
                insertions: 4,
              },
            "realm/realm-library/src/objectServer/java/io/realm/exceptions/DownloadingRealmInterruptedException.java":
              {
                deletions: 0,
                insertions: 3,
              },
            "realm/realm-library/src/objectServer/java/io/realm/internal/SyncObjectServerFacade.java":
              {
                deletions: 1,
                insertions: 48,
              },
            "realm/realm-library/src/objectServer/java/io/realm/internal/sync/permissions/ObjectPermissionsModule.java":
              {
                deletions: 1,
                insertions: 6,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/IsolatedIntegrationTests.java":
              {
                deletions: 2,
                insertions: 6,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/StandardIntegrationTest.java":
              {
                deletions: 2,
                insertions: 6,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/SyncSessionTests.java":
              {
                deletions: 36,
                insertions: 54,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/SyncedRealmIntegrationTests.java":
              {
                deletions: 6,
                insertions: 21,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/objectserver/AuthTests.java":
              {
                deletions: 4,
                insertions: 4,
              },
            "realm/realm-library/src/syncIntegrationTest/java/io/realm/objectserver/QueryBasedSyncTests.java":
              {
                deletions: 3,
                insertions: 102,
              },
            "realm/realm-library/src/syncTestUtils/java/io/realm/SyncTestUtils.java":
              {
                deletions: 15,
                insertions: 17,
              },
            "realm/realm-library/src/testUtils/java/io/realm/TestHelper.java": {
              deletions: 3,
              insertions: 0,
            },
            "realm/realm-library/src/testUtils/java/io/realm/rule/RunInLooperThread.java":
              {
                deletions: 25,
                insertions: 47,
              },
          },
        },
      },
      seq: 15533,
    },
  ];
  const sortedData = dummySortedData;

  /**
   * TODO 2. 시간 순으로 정렬하기
   */

  return sortedData;
}
