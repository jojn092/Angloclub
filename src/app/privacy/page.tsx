import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow max-w-4xl mx-auto px-4 py-12 text-[var(--text)]">
                <h1 className="text-3xl font-bold mb-6">Политика конфиденциальности</h1>
                <p className="text-[var(--text-secondary)] mb-8">Последнее обновление: {new Date().toLocaleDateString('ru-RU')}</p>

                <div className="space-y-6">
                    <section>
                        <h2 className="text-xl font-bold mb-3">1. Общие положения</h2>
                        <p>Настоящая политика обработки персональных данных составлена в соответствии с требованиями Закона Республики Казахстан «О персональных данных и их защите» и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных, предпринимаемые школой английского языка AngloClub Astana.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3">2. Какие данные мы собираем</h2>
                        <p>Мы можем собирать следующие персональные данные Пользователя:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Фамилия, имя, отчество;</li>
                            <li>Номер телефона;</li>
                            <li>Адрес электронной почты;</li>
                            <li>Данные, которые автоматически передаются сервисам сайта в процессе их использования с помощью установленного на устройстве Пользователя программного обеспечения.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3">3. Цели обработки данных</h2>
                        <p>Мы собираем и обрабатываем данные для следующих целей:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Оказание образовательных услуг;</li>
                            <li>Связь с клиентом для подтверждения записи на курсы;</li>
                            <li>Отправка уведомлений о занятиях, изменениях в расписании и акциях;</li>
                            <li>Улучшение качества работы сайта и сервиса.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3">4. Защита данных</h2>
                        <p>Мы принимаем необходимые организационные и технические меры для защиты персональной информации Пользователя от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования, распространения.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3">5. Контакты</h2>
                        <p>По вопросам, касающимся обработки персональных данных, вы можете связаться с нами по телефону или электронной почте, указанным на сайте.</p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    )
}
