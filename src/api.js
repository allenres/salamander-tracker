export async function getVideos() {
  //fetch
  const res = await fetch('/api/videos');

  //handle response
  if(!res.ok) {
    throw new Error(`Server responded with ${res.status}`)
  }

  //return response
  return res.json();
}

export async function getThumbnail(thumbnail){
  //fetch thumbnail
  const thumbnailUrl = `/thumbnail/${thumbnail}`
  const res = await fetch(thumbnail);

  //handle response
  if(!res.ok) {
    throw new Error(`No thumbnail available ${res.status}`)
  }
  
  //return thumbnail
  return thumbnailUrl;
}

export async function submitProcessingJob(filename, targetColor, threshold){
  // clean target color
  const cleanedHex = targetColor.replace('#', "");
  const res = await fetch(`/process/${filename}?targetColor=${cleanedHex}&threshold=${threshold}`,{method: "POST"});

  //handle response
  if(!res.ok){
    throw new Error(`Server could not process job ${res.status}`);
  }

  //return response
  return res.json();
}

export async function getJobStatus(jobId) {
  // fetch
  const res = await fetch(`/process/${jobId}/status`);

  // handle response
  if (!res.ok) {
    throw new Error(`Server responded ${res.status}`);
  }

  //return response
  return res.json();
}
