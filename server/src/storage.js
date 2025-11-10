import { BlobServiceClient } from '@azure/storage-blob';

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING || ''
);

const containerName = process.env.AZURE_STORAGE_CONTAINER || 'document-processor';

export const uploadToAzureBlob = async (data, fileName) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blobName = `${Date.now()}-${fileName}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const jsonData = JSON.stringify(data);
    await blockBlobClient.upload(jsonData, jsonData.length);

    const url = `${containerClient.getContainerClient(containerName).getBlockBlobClient(blobName).url}`;
    return url;
  } catch (error) {
    console.error('Azure Blob upload error:', error);
    throw new Error(`Failed to upload to Azure Blob Storage: ${error.message}`);
  }
};

export const getAzureBlobUrl = (fileName) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    return blockBlobClient.url;
  } catch (error) {
    throw new Error(`Failed to get blob URL: ${error.message}`);
  }
};
