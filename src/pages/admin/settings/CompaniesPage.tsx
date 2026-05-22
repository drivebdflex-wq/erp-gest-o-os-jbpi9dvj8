import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Building2,
  Save,
  Upload,
  Image as ImageIcon,
  MapPin,
  Briefcase,
  Camera,
  Loader2,
} from 'lucide-react'

import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const companyFormSchema = z.object({
  name: z.string().min(1, 'Razão Social é obrigatória'),
  trading_name: z.string().optional(),
  document: z.string().min(1, 'CNPJ é obrigatório'),
  state_registration: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').or(z.literal('')).optional(),
  website: z.string().url('Site inválido').or(z.literal('')).optional(),
  zip_code: z.string().optional(),
  address: z.string().optional(),
  address_number: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  slogan: z.string().optional(),
  technical_responsible: z.string().optional(),
  crea: z.string().optional(),
  cnae: z.string().optional(),
  billing_info: z.string().optional(),
})

type CompanyFormValues = z.infer<typeof companyFormSchema>

const formatCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18)
}

const formatPhone = (value: string) => {
  const v = value.replace(/\D/g, '')
  if (v.length <= 10) {
    return v.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').substring(0, 15)
}

const formatCEP = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .substring(0, 9)
}

export default function CompaniesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: '',
      trading_name: '',
      document: '',
      state_registration: '',
      phone: '',
      email: '',
      website: '',
      zip_code: '',
      address: '',
      address_number: '',
      city: '',
      state: '',
      slogan: '',
      technical_responsible: '',
      crea: '',
      cnae: '',
      billing_info: '',
    },
  })

  useEffect(() => {
    fetchCompany()
  }, [])

  const fetchCompany = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('companies').select('*').limit(1).single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setCompanyId(data.id)
        setLogoUrl(data.logo_url)
        form.reset({
          name: data.name || '',
          trading_name: data.trading_name || '',
          document: data.document || '',
          state_registration: data.state_registration || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          zip_code: data.zip_code || '',
          address: data.address || '',
          address_number: data.address_number || '',
          city: data.city || '',
          state: data.state || '',
          slogan: data.slogan || '',
          technical_responsible: data.technical_responsible || '',
          crea: data.crea || '',
          cnae: data.cnae || '',
          billing_info: data.billing_info || '',
        })
      }
    } catch (error) {
      console.error('Error fetching company:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados da empresa.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      setUploadingLogo(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `logo_${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('company-logos').getPublicUrl(filePath)

      setLogoUrl(data.publicUrl)
      toast({ title: 'Logo enviada com sucesso!' })
    } catch (error) {
      toast({ title: 'Erro ao fazer upload da logo', variant: 'destructive' })
    } finally {
      setUploadingLogo(false)
    }
  }

  const onSubmit = async (values: CompanyFormValues) => {
    try {
      setSaving(true)

      const payload = {
        ...values,
        logo_url: logoUrl,
        updated_at: new Date().toISOString(),
      }

      let error

      if (companyId) {
        const { error: updateError } = await supabase
          .from('companies')
          .update(payload)
          .eq('id', companyId)
        error = updateError
      } else {
        const { data, error: insertError } = await supabase
          .from('companies')
          .insert([payload])
          .select()
          .single()

        if (data) {
          setCompanyId(data.id)
        }
        error = insertError
      }

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Dados da empresa atualizados com sucesso.',
      })
    } catch (error) {
      console.error('Error saving company:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar os dados.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Empresa Principal</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Dados Básicos</span>
                <span className="sm:hidden">Básicos</span>
              </TabsTrigger>
              <TabsTrigger value="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Endereço</span>
                <span className="sm:hidden">Endereço</span>
              </TabsTrigger>
              <TabsTrigger value="visual" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Identidade Visual</span>
                <span className="sm:hidden">Visual</span>
              </TabsTrigger>
              <TabsTrigger value="operational" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Operacional</span>
                <span className="sm:hidden">Op.</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Dados Básicos</CardTitle>
                  <CardDescription>Informações principais e de contato da empresa.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Razão Social</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="trading_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Fantasia</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="document"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => field.onChange(formatCNPJ(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state_registration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inscrição Estadual</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => field.onChange(formatPhone(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Site</FormLabel>
                          <FormControl>
                            <Input type="url" placeholder="https://" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="address">
              <Card>
                <CardHeader>
                  <CardTitle>Endereço</CardTitle>
                  <CardDescription>Localização da matriz da empresa.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="zip_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => field.onChange(formatCEP(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="hidden md:block" />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Endereço (Logradouro)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado (UF)</FormLabel>
                          <FormControl>
                            <Input maxLength={2} className="uppercase" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="visual">
              <Card>
                <CardHeader>
                  <CardTitle>Identidade Visual</CardTitle>
                  <CardDescription>
                    Logotipo e slogan para relatórios e ordens de serviço.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    <Avatar className="h-32 w-32 rounded-lg border bg-muted">
                      <AvatarImage src={logoUrl || ''} className="object-contain" />
                      <AvatarFallback className="rounded-lg bg-muted text-muted-foreground">
                        <ImageIcon className="h-10 w-10" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <FormLabel>Logotipo da Empresa</FormLabel>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('logo-upload')?.click()}
                          disabled={uploadingLogo}
                        >
                          {uploadingLogo ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Enviar Nova Foto
                        </Button>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Recomendado: PNG ou JPG, fundo transparente, máx 2MB.
                      </p>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="slogan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slogan</FormLabel>
                        <FormControl>
                          <Input placeholder="Sua mensagem de impacto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="operational">
              <Card>
                <CardHeader>
                  <CardTitle>Dados Operacionais</CardTitle>
                  <CardDescription>
                    Configurações para emissão de documentos técnicos e faturamento.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="technical_responsible"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsável Técnico</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="crea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registro (CREA/CAU)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cnae"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>CNAE Principal</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="billing_info"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Informações de Faturamento (Padrão)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Dados bancários, instruções de nota fiscal, etc."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
