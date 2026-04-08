import { isMock } from '@/lib/supabase'

export class StorageService {
  static async clearBucket(bucket: string): Promise<void> {
    if (isMock) {
      console.log(`[Mock] Cleared bucket: ${bucket}`)
      return Promise.resolve()
    }
    // Implementação real para o Supabase:
    /*
    const { data: files } = await supabase.storage.from(bucket).list()
    if (files && files.length > 0) {
      const fileNames = files.map(f => f.name)
      await supabase.storage.from(bucket).remove(fileNames)
    }
    */
  }

  static async uploadFile(bucket: string, file: File): Promise<string> {
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Arquivo muito grande. O tamanho máximo permitido é 10MB.')
    }

    if (isMock) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    }

    // Mock implementation for Supabase
    return URL.createObjectURL(file)
  }

  /**
   * Mock implementation of image upload to a bucket.
   * Handles format and size validation.
   */
  static async uploadImage(bucket: string, file: File): Promise<string> {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      throw new Error('Formato inválido. Apenas JPG e PNG são permitidos.')
    }
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Arquivo muito grande. O tamanho máximo permitido é 2MB.')
    }

    if (isMock) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    }

    // Em um ambiente real com Supabase configurado, este código seria executado:
    /*
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (uploadError) {
      throw new Error('Erro ao fazer upload da imagem.')
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
    return data.publicUrl
    */

    return URL.createObjectURL(file)
  }
}
