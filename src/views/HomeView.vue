<template>
  <div class="home-page">
    <section class="hero">
      <h1>Welcome to MotoCraft-TwoHeads</h1>
      <p>
        Your trusted motorcycle workshop management app, where enthusiasts, mechanics, and riders come together to share and validate maintenance knowledge. Join us today and contribute your experiences while earning rewards and recognition.
      </p>
      <button @click="navigateToSignUp">Sign Up / Register</button>
    </section>

    <section class="call-to-action-images">
      <!-- Collaborate with Community Image -->
      <div class="cta-image">
        <img src="../assets/CollaborateCommunity.png" alt="Collaborate with Community" />
        <h2>Collaborate with Community</h2>
        <p>Work with fellow riders and mechanics to improve and validate the resources available to everyone.</p>
      </div>

      <!-- Validate and Earn Rewards Image -->
      <div class="cta-image">
        <img src="../assets/ValidateEarnRewards.png" alt="Validate and Earn Rewards" />
        <h2>Validate and Earn Rewards</h2>
        <p>Help validate maintenance tasks, parts, and costs, and earn rewards for your contributions.</p>
      </div>

      <!-- Add Parts, Tasks, and Costs Image -->
      <div class="cta-image">
        <img src="../assets/AddPartsTasksCosts.png" alt="Add Parts, Tasks, and Costs" />
        <h2>Add Parts, Tasks, and Costs</h2>
        <p>Contribute your knowledge on motorcycle parts, tasks, and costs to help others with their projects.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToSignUp = () => {
  router.push({ name: "SignUp" });
};
</script>

<style scoped>
.home-page {
  padding: 20px;
  font-family: Arial, sans-serif;
  text-align: center;
}

.hero {
  margin-bottom: 40px;
  background-color: #f4f4f4;
  padding: 40px;
  border-radius: 10px;
}

.hero h1 {
  font-size: 2.5em;
  margin-bottom: 20px;
}

.hero p {
  font-size: 1.2em;
  margin-bottom: 20px;
}

.hero button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1em;
  cursor: pointer;
}

.hero button:hover {
  background-color: #0056b3;
}

.call-to-action-images {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.cta-image {
  width: 30%;
  margin: 20px 0;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.cta-image img {
  max-width: 100%;
  height: auto;
  margin-bottom: 10px;
}

.cta-image h2 {
  font-size: 1.5em;
  margin-bottom: 10px;
}

.cta-image p {
  font-size: 1.1em;
}
</style>

