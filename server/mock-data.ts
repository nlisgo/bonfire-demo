import { faker } from "@faker-js/faker";
import { storage } from "./storage";
import type { User } from "@shared/schema";

// Generate mock users
async function createMockUser(override: Partial<User> = {}): Promise<User> {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const displayName = `${firstName} ${lastName}`;
  const username = override.username || faker.internet.username({ firstName, lastName }).toLowerCase();

  return await storage.createUser({
    username,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    displayName,
    bio: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.7 }) || null,
    avatarUrl: faker.image.avatar(),
    isOnline: faker.datatype.boolean(),
  });
}

// Initialize mock data
export async function initializeMockData() {
  // Check if data already exists
  const existingDemo = await storage.getUserByUsername("demo");
  if (existingDemo) {
    console.log("Mock data already initialized");
    return;
  }

  console.log("Initializing mock data...");

  // Create demo user
  const demoUser = await createMockUser({
    username: "demo",
    email: "demo@bonfire.local",
    displayName: "Demo User",
    bio: "This is the demo account for testing Bonfire integration",
    isOnline: true,
  });

  // Create additional users
  const users: User[] = [demoUser];
  for (let i = 0; i < 8; i++) {
    const user = await createMockUser();
    users.push(user);
  }

  console.log(`Created ${users.length} mock users`);

  // Create conversations
  const conversationCount = 5;
  for (let i = 0; i < conversationCount; i++) {
    const isGroup = faker.datatype.boolean({ probability: 0.3 });
    const participantIds = [demoUser.id];

    if (isGroup) {
      // Group conversation with 3-5 participants
      const groupSize = faker.number.int({ min: 2, max: 4 });
      const otherUsers = faker.helpers.arrayElements(
        users.filter((u) => u.id !== demoUser.id),
        groupSize
      );
      participantIds.push(...otherUsers.map((u) => u.id));
    } else {
      // 1-on-1 conversation
      const otherUser = faker.helpers.arrayElement(
        users.filter((u) => u.id !== demoUser.id)
      );
      participantIds.push(otherUser.id);
    }

    const conversation = await storage.createConversation(
      {
        title: isGroup ? faker.company.buzzPhrase() : null,
        isGroup,
      },
      participantIds
    );

    // Create 3-10 messages per conversation
    const messageCount = faker.number.int({ min: 3, max: 10 });
    for (let j = 0; j < messageCount; j++) {
      const senderId = faker.helpers.arrayElement(participantIds);
      await storage.createMessage({
        conversationId: conversation.id,
        senderId,
        content: faker.lorem.sentences({ min: 1, max: 3 }),
      });
    }
  }

  console.log(`Created ${conversationCount} conversations with messages`);

  // Create activity feed items
  const activityCount = 15;
  const verbs = ["posted", "liked", "shared", "followed", "commented"];
  const objectTypes = ["post", "comment", "user", "article"];

  for (let i = 0; i < activityCount; i++) {
    const subject = faker.helpers.arrayElement(users.filter((u) => u.id !== demoUser.id));
    const verb = faker.helpers.arrayElement(verbs);
    const objectType = verb === "followed" ? "user" : faker.helpers.arrayElement(objectTypes);

    let objectContent = null;
    if (["posted", "commented"].includes(verb)) {
      objectContent = faker.lorem.paragraph({ min: 1, max: 3 });
    }

    await storage.createActivity({
      subjectId: subject.id,
      verb,
      objectType,
      objectId: faker.string.uuid(),
      objectContent,
    });
  }

  console.log(`Created ${activityCount} activity items`);
  console.log("Mock data initialization complete!");
}
