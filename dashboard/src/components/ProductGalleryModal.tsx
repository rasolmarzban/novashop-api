
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
  deleteProductImage,
  getProductImageUrl,
  reorderProductImages,
  setFeaturedProductImage,
  uploadProductImages,
  type Product,
  type ProductImage,
} from '../services/product.service';

import { useProduct, productKeys } from '../services/product.queries';

import './ProductGalleryModal.css';

interface ProductGalleryModalProps {
  productId: number;
  productName: string;
  onClose: () => void;
}

export default function ProductGalleryModal({
  productId,
  productName,
  onClose,
}: ProductGalleryModalProps) {
  const queryClient = useQueryClient();
  const productQuery = useProduct(productId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [busyImageId, setBusyImageId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const product = productQuery.data;
  const images = [...(product?.images ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  function updateCachedImages(nextImages: ProductImage[]) {
    queryClient.setQueryData<Product>(
      productKeys.detail(productId),
      (current) => (current ? { ...current, images: nextImages } : current),
    );

    void queryClient.invalidateQueries({
      queryKey: productKeys.lists(),
    });
  }

  function handleFileSelection(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? []);
    setError('');
    setMessage('');

    const invalidFile = files.find(
      (file) => !file.type.startsWith('image/'),
    );

    if (invalidFile) {
      setError('Please select image files only.');
      setSelectedFiles([]);
      event.target.value = '';
      return;
    }

    const tooLarge = files.find((file) => file.size > 5 * 1024 * 1024);

    if (tooLarge) {
      setError('Each image must be 5 MB or smaller.');
      setSelectedFiles([]);
      event.target.value = '';
      return;
    }

    if (files.length > 10) {
      setError('Select up to 10 images per upload.');
      setSelectedFiles([]);
      event.target.value = '';
      return;
    }

    setSelectedFiles(files);
  }

  async function handleUpload() {
    if (!selectedFiles.length) {
      setError('Select at least one image to upload.');
      return;
    }

    setIsUploading(true);
    setError('');
    setMessage('');

    try {
      const uploaded = await uploadProductImages(productId, selectedFiles);
      updateCachedImages([...images, ...uploaded]);

      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setMessage(`${uploaded.length} image(s) uploaded successfully.`);
    } catch {
      setError('Image upload failed. Check your connection and try again.');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSetFeatured(imageId: number) {
    setBusyImageId(imageId);
    setError('');
    setMessage('');

    try {
      await setFeaturedProductImage(productId, imageId);

      updateCachedImages(
        images.map((image) => ({
          ...image,
          isFeatured: image.id === imageId,
        })),
      );

      setMessage('Featured image updated.');
    } catch {
      setError('Could not set the featured image.');
    } finally {
      setBusyImageId(null);
    }
  }

  async function handleMove(imageId: number, direction: -1 | 1) {
    const currentIndex = images.findIndex((image) => image.id === imageId);
    const targetIndex = currentIndex + direction;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= images.length) {
      return;
    }

    const reordered = [...images];
    [reordered[currentIndex], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[currentIndex],
    ];

    setBusyImageId(imageId);
    setError('');
    setMessage('');

    try {
      const updatedProduct = await reorderProductImages(
        productId,
        reordered.map((image) => image.id),
      );

      queryClient.setQueryData<Product>(
        productKeys.detail(productId),
        updatedProduct,
      );

      void queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });

      setMessage('Image order saved.');
    } catch {
      setError('Could not change the image order.');
    } finally {
      setBusyImageId(null);
    }
  }

  async function handleDelete(image: ProductImage) {
    const confirmed = window.confirm(
      `Delete this image from "${productName}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    setBusyImageId(image.id);
    setError('');
    setMessage('');

    try {
      await deleteProductImage(productId, image.id);
      updateCachedImages(images.filter((item) => item.id !== image.id));
      setMessage('Image deleted.');
    } catch {
      setError('Could not delete the image.');
    } finally {
      setBusyImageId(null);
    }
  }

  return (
    <div
      className="gallery-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="gallery-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-modal-title"
      >
        <header className="gallery-modal-header">
          <div>
            <h2 id="gallery-modal-title">Product gallery</h2>
            <p>{productName} · Product #{productId}</p>
          </div>

          <button
            type="button"
            className="gallery-close-button"
            onClick={onClose}
            aria-label="Close gallery"
          >
            ✕
          </button>
        </header>

        {productQuery.isLoading ? (
          <p className="gallery-status">Loading gallery...</p>
        ) : productQuery.isError || !product ? (
          <p className="gallery-error">Could not load this product's images.</p>
        ) : (
          <>
            <div className="gallery-upload-section">
              <h3>Upload images</h3>
              <p>JPG, PNG, WEBP or GIF · Maximum 5 MB per image · Up to 10 per upload</p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleFileSelection}
              />

              {selectedFiles.length > 0 && (
                <>
                  <div className="gallery-preview-grid">
                    {selectedFiles.map((file, index) => (
                      <div className="gallery-preview" key={`${file.name}-${index}`}>
                        <img src={previewUrls[index]} alt={file.name} />
                        <span title={file.name}>{file.name}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    {isUploading
                      ? 'Uploading...'
                      : `Upload ${selectedFiles.length} image(s)`}
                  </button>
                </>
              )}
            </div>

            <div className="gallery-images-section">
              <h3>Gallery images ({images.length})</h3>

              {images.length === 0 ? (
                <p className="gallery-status">
                  No images yet. Upload images above to get started.
                </p>
              ) : (
                <div className="gallery-image-grid">
                  {images.map((image, index) => (
                    <article className="gallery-image-card" key={image.id}>
                      <div className="gallery-image-frame">
                        <img
                          src={getProductImageUrl(image.url)}
                          alt={image.altText ?? `${productName} image ${index + 1}`}
                        />
                        {image.isFeatured && (
                          <span className="gallery-featured-badge">
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="gallery-image-details">
                        <span>Image #{image.id}</span>
                        <span>Position {index + 1}</span>
                      </div>

                      <div className="gallery-image-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={image.isFeatured || busyImageId !== null}
                          onClick={() => handleSetFeatured(image.id)}
                        >
                          {image.isFeatured ? 'Featured image' : 'Set featured'}
                        </button>

                        <div className="gallery-order-actions">
                          <button
                            type="button"
                            className="secondary-button"
                            aria-label="Move image left"
                            title="Move earlier"
                            disabled={index === 0 || busyImageId !== null}
                            onClick={() => handleMove(image.id, -1)}
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            className="secondary-button"
                            aria-label="Move image right"
                            title="Move later"
                            disabled={
                              index === images.length - 1 ||
                              busyImageId !== null
                            }
                            onClick={() => handleMove(image.id, 1)}
                          >
                            →
                          </button>
                          <button
                            type="button"
                            className="gallery-delete-button"
                            disabled={busyImageId !== null}
                            onClick={() => void handleDelete(image)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {error && <p className="gallery-error" role="alert">{error}</p>}
        {message && <p className="gallery-success" role="status">{message}</p>}

        <footer className="gallery-modal-footer">
          <button type="button" className="secondary-button" onClick={onClose}>
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}
