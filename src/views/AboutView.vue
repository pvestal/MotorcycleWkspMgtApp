<template>
  <div class="about-page">
    <section class="content hero">
      <img
        src="../assets/Logo.PNG"
        alt="MotoCraft-TwoHeads Logo"
        class="inline-image"
        @click="showFullScreen = true"
      />
      <h1>About MotoCraft-TwoHeads</h1>
      <p>
        At MotoCraft-TwoHeads, we're more than just a motorcycle workshop management app—we're a growing community of riders, mechanics, and enthusiasts. Together, we share not just a love for motorcycles but also the knowledge and passion for keeping them running smoothly. Our mission is simple: to build a resource where anyone can validate motorcycle maintenance and contribute their own experiences, making it easier for others to care for their bikes.
      </p>

      <h2>Validate Maintenance Tasks and Share Knowledge</h2>
      <p>
        Imagine having a trusted resource where every maintenance task is backed by real-world experiences from fellow motorcycle owners. At MotoCraft-TwoHeads, you can validate or contribute to the maintenance schedules for your specific bike. Share your expertise or confirm whether a recommended task worked for your model. The more we share, the more reliable the app becomes for everyone.
      </p>

      <h2>Contribute and Earn Rewards</h2>
      <p>
        Contributing to MotoCraft-TwoHeads means more than just sharing information. Every time you confirm a task or provide feedback on a repair, you earn points that unlock badges, rewards, and even roles within our community. Whether you're a novice rider or a seasoned mechanic, there's always a way to help and get recognized for it.
      </p>

      <h2>Restoring and Repairing: A Labor of Love</h2>
      <p>
        There's nothing quite like bringing an old, forgotten bike back to life. We believe in the art of restoration—taking the time to carefully repair, restore, and customize motorcycles to their former glory or beyond. Whether you're working on a vintage classic or a modern machine, MotoCraft-TwoHeads celebrates the journey of restoration and craftsmanship.
      </p>

      <h2>Finding Great Deals and Sharing Them</h2>
      <p>
        Our community isn't just about fixing bikes; it's also about finding the best deals. MotoCraft-TwoHeads is a place where users share tips on where to get the best parts, accessories, and upgrades. With our collective knowledge, you can score deals that make every project come together seamlessly.
      </p>

      <h2>Why MotoCraft-TwoHeads?</h2>
      <p>
        At MotoCraft-TwoHeads, we believe that knowledge should be shared and accessible to all. Every validation, contribution, and piece of feedback you provide helps build a more accurate and reliable resource for riders everywhere. Join us in creating the ultimate motorcycle maintenance hub—where each contribution makes riding better for everyone.
      </p>
      <button @click="navigateToSignUp">Sign Up / Register</button>
    </section>
    
    <!-- Fullscreen Image Modal -->
    <div v-if="showFullScreen" class="fullscreen-modal" @click="showFullScreen = false">
      <img src="../assets/Logo.PNG" alt="MotoCraft-TwoHeads Logo" class="fullscreen-image" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const showFullScreen = ref(false);
const router = useRouter();

const navigateToSignUp = () => {
  router.push({ name: "SignUp" });
};
</script>

<style scoped>
.about-page {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.inline-image {
  float: left; /* Floats the image to the left so the text wraps around it */
  margin: 0 20px 20px 0;
  width: 200px; /* Adjust the size of the inline image */
  cursor: pointer; /* Changes cursor to pointer to indicate the image is clickable */
}

.fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8); /* Dark background for the modal */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* High z-index to ensure it overlays everything else */
}

.fullscreen-image {
  max-width: 90%;
  max-height: 90%;
  cursor: pointer; /* Changes cursor to pointer to indicate you can click to exit */
}

.hero {
  margin-bottom: 40px;
  background-color: #f4f4f4;
  padding: 40px;
  border-radius: 10px;
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
</style>
