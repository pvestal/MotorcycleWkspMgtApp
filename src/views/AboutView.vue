<template>
  <div class="about-page">
    <section class="content">
      <img
        src="../assets/Logo.PNG"
        alt="MotoCraft-TwoHeads Logo"
        class="inline-image"
        @click="showFullScreen = true"
      />
      <h1>About MotoCraft-TwoHeads</h1>
      <p>
        At MotoCraft-TwoHeads, we're more than just a workshop management app.
        We're a community of motorcycle enthusiasts who share a deep passion
        for everything on two wheels. Whether it's the thrill of the ride,
        the satisfaction of a well-done repair, or the hunt for that perfect
        part, we understand the joys and challenges that come with motorcycle
        ownership.
      </p>
      <h2>Restoring and Repairing: A Labor of Love</h2>
      <p>
        There's nothing quite like bringing an old, forgotten bike back to
        life. We believe in the art of restoration—taking the time to carefully
        repair, restore, and customize motorcycles to their former glory or
        beyond. Whether you're working on a vintage classic or a modern
        machine, the process of restoration is a journey that we cherish and
        celebrate.
      </p>
      <h2>Finding Good Deals, Together</h2>
      <p>
        A great deal is always around the corner if you know where to look.
        At MotoCraft-TwoHeads, we're all about sharing tips, tricks, and
        resources for finding the best deals on parts, bikes, and accessories.
        Our community thrives on helping each other score those elusive finds
        that make a project come together.
      </p>
      <h2>Working and Riding, Side by Side</h2>
      <p>
        There's something special about spending time in the garage with
        friends, working on bikes, and sharing the knowledge that comes with
        experience. And when the work is done, there's no better feeling than
        hitting the open road on a bike that you've poured your heart and soul
        into. At MotoCraft-TwoHeads, we're here to celebrate these moments,
        big and small, that bring us together.
      </p>
    </section>

    <!-- Fullscreen Image Modal -->
    <div v-if="showFullScreen" class="fullscreen-modal" @click="showFullScreen = false">
      <img src="../assets/Logo.PNG" alt="MotoCraft-TwoHeads Logo" class="fullscreen-image" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const showFullScreen = ref(false);
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
</style>
