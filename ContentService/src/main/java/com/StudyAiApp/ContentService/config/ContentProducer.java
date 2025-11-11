package com.StudyAiApp.ContentService.config;

import com.StudyAiApp.ContentService.models.ContentModel;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
@RequiredArgsConstructor
public class ContentProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.name}")
    private String exchangeName;

    @Value("${rabbitmq.routing.key}")
    private String routingKey;

    @PostConstruct
    public void init() {

        rabbitTemplate.setMessageConverter(new Jackson2JsonMessageConverter());
    }

    public void sendContent(ContentModel content) {
        rabbitTemplate.convertAndSend(exchangeName, routingKey, content);
        System.out.println("Sent content to RabbitMQ: " + content.getTitle());
    }
}
